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
                const { latitude, longitude } = station;

                if (latitude && longitude) {
                    // Converter latitude e longitude para EPSG:3857
                    const coordinates = fromLonLat([longitude, latitude]);

                    // Adicionar um ponto para cada estação
                    const feature = new Feature({
                        geometry: new Point(coordinates), // Usar as coordenadas convertidas
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
