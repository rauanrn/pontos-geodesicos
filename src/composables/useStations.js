import { ref } from 'vue';
import { getStationsByState } from '../api/bdgApi';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster';
import Feature from 'ol/Feature';
import { Tile, Vector as VectorLayerMalha } from 'ol/layer';
import { Vector as VectorSourceMalha } from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import Point from 'ol/geom/Point';
import { Style, Icon, Stroke, Text, Fill, Circle as CircleStyle } from 'ol/style';
import { fromLonLat } from 'ol/proj'; // Converter coordenadas
import pinIcon from '@/assets/icons8-pin-50.png';
import "ol/ol.css";
import Overlay from 'ol/Overlay';

export const useStations = () => {
    const stations = ref([]);
    const error = ref(null);
    const pinsLayer = ref(null);
    const vectorLayerMalha = ref(null);

    const fetchStationsByState = async (stateSigla, map) => {
        try {
            const data = await getStationsByState(stateSigla); // Buscar as estações

            if (!data || data.length === 0) {
                throw new Error('Nenhuma estação encontrada.');
            }

            stations.value = data;

            if (vectorLayerMalha.value){
                map.removeLayer(vectorLayerMalha.value);
            }

            // Camada malha do estado
            const vectorSourceMalha = new VectorSourceMalha({
                url: `https://servicodados.ibge.gov.br/api/v3/malhas/estados/${stateSigla}?formato=application/vnd.geo+json`,
                format: new GeoJSON(),
            });

            vectorLayerMalha.value = new VectorLayerMalha({
                source: vectorSourceMalha,
                style: new Style({
                    fill: new Fill({ color: 'rgba(255, 255, 255, 0.5)' }),
                    stroke: new Stroke({ color: '#888', width: 2 }),
                }),
            });

            map.addLayer(vectorLayerMalha.value); // Adiciona a camada da malha ao mapa


            // Evento de clique para focar no estado e mudar o estilo
            map.on('singleclick', (event) => {
                map.forEachFeatureAtPixel(event.pixel, (feature) => {
                    const geometry = feature.getGeometry();
                    map.getView().fit(geometry, { padding: [50, 50, 50, 50], duration: 1000 });
                    feature.setStyle(
                        new Style({
                            fill: new Fill({ color: 'rgba(50, 150, 250, 0.3)' }),
                            stroke: new Stroke({ color: '#0055aa', width: 3 }),
                        })
                    );
                });
            });

            // Criar a fonte de dados para os pins
            const vectorSource = new VectorSource();


            // Adiciona um ponto para cada estação
            data.forEach((station) => {
                const { latitude, longitude, descricaoEstacao } = station;

                if (latitude && longitude) {
                    // Converter latitude e longitude para EPSG:3857
                    const coordinates = fromLonLat([longitude, latitude]);

                    // Adicionar um ponto para cada estação
                    const feature = new Feature({
                        geometry: new Point(coordinates),
                        descricaoEstacao: descricaoEstacao // Usar as coordenadas convertidas
                    });

                    vectorSource.addFeature(feature);
                }
            });

            // Configurar o agrupamento de pins
            const clusterSource = new Cluster({
                distance: 50, // Distância de agrupamento em pixels
                source: vectorSource,
            });

            // Estilo para clusters
            const clusterStyle = (feature) => {
                const size = feature.get('features').length;
                if (size > 1) {
                    return new Style({
                        image: new CircleStyle({
                            radius: 15,
                            fill: new Fill({ color: '#ff5722' }), // Cor do cluster
                        }),
                        text: new Text({
                            text: size.toString(), // Quantidade de itens no cluster
                            fill: new Fill({ color: '#fff' }),
                        }),
                    });
                } else {
                    return new Style({
                        image: new Icon({
                            src: pinIcon, // Ícone do pin individual
                            scale: 1,
                            anchor: [0.5, 1], // Alinhar na parte inferior (0.5 para centralizar horizontalmente, 1 para a base vertical)
                            anchorXUnits: 'fraction', // Usa a fração da largura do ícone
                            anchorYUnits: 'fraction' // Usa a fração da altura do ícone
                        }),
                    });
                }
            };

            // Criar a camada de pins agrupados
            if (pinsLayer.value) {
                map.removeLayer(pinsLayer.value); // Remover a camada anterior se existir
            }

            pinsLayer.value = new VectorLayer({
                source: clusterSource,
                style: clusterStyle, // Aplicar estilo ao cluster
            });

            map.addLayer(pinsLayer.value); // Adicionar a nova camada ao mapa

            // Criar o overlay do popup
            const popup = new Overlay({
                element: document.getElementById('popup'), // ID do elemento HTML do popup
                positioning: 'bottom-center',
                stopEvent: false,
            });
            map.addOverlay(popup);

            // Evento de mouse para mostrar o popup ao passar o mouse sobre o pin
            map.on('pointermove', (event) => {

                const featurePopup = map.forEachFeatureAtPixel(event.pixel, (feature) => {
                    // Verifica se o feature é um cluster
                    if (feature.get('features')) {
                        // Se for um cluster, pega a primeira feature dentro do cluster (por exemplo, o primeiro pin)
                        const features = feature.get('features');
                        return features[0]; // Retorna o primeiro pin individual dentro do cluster
                    }
                    // Se não for cluster, retorna o feature diretamente (pin individual)
                    return feature;
                });

                if (featurePopup) {
                    // Exibir o popup com a descrição da estação
                    const coordinates = featurePopup.getGeometry().getCoordinates();
                    const descricaoEstacao = featurePopup.get('descricaoEstacao'); // Pega a descrição da estação
                    if (descricaoEstacao){
                        popup.setPosition(coordinates);
                        document.getElementById('popup-content').innerHTML = descricaoEstacao; // Exibir a descrição da estação
                        document.getElementById('popup').style.display = 'block';
                    }else{
                        document.getElementById('popup').style.display = 'none'; // Ocultar o popup
                    }
                } else {
                    document.getElementById('popup').style.display = 'none'; // Ocultar o popup
                }
            });

        } catch (err) {
            error.value = err.message || 'Erro desconhecido';
            console.error(err);
        }
    };

    return {
        stations,
        error,
        fetchStationsByState,
    };
};
