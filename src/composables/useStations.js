import { ref } from 'vue';
import { getStationsByState } from '../api/bdgApi';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Cluster from 'ol/source/Cluster';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Icon, Text, Fill, Circle as CircleStyle } from 'ol/style';
import { fromLonLat } from 'ol/proj'; // Converter coordenadas
import pinIcon from '@/assets/icons8-pin-50.png';
import "ol/ol.css";

export const useStations = () => {
    const stations = ref([]);
    const error = ref(null);
    const pinsLayer = ref(null);

    const fetchStationsByState = async (stateSigla, map) => {
        try {
            const data = await getStationsByState(stateSigla);
            stations.value = data;

            // Criar uma fonte de dados para os pins
            const vectorSource = new VectorSource();

            data.forEach((station) => {
                const { latitude, longitude } = station;

                // Converter latitude e longitude para EPSG:3857
                const coordinates = fromLonLat([longitude, latitude]);

                // Adicionar um ponto para cada estação
                const feature = new Feature({
                    geometry: new Point(coordinates), // Usar as coordenadas convertidas
                });

                vectorSource.addFeature(feature);
            });

            // Configurar o agrupamento
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
        }
    };

    return {
        stations,
        error,
        fetchStationsByState,
    };
};
