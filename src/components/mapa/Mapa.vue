<template>
    <div>
        <select class="select-estados" v-model="selectedState" @change="fetchStations">
            <option disabled value="">Selecione um estado</option>
            <option v-for="state in states" :key="state.sigla" :value="state.sigla">
                {{ state.nome }}
            </option>
        </select>
        <div ref="map" class="map-container"></div>
    </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj'; // Importar função para converter coordenadas
import { useStations } from '../../composables/useStations';
import "./mapa.css"

export default {
    name: 'StationsMap',
    setup() {
        const mapElement = ref(null);
        const map = ref(null);
        const selectedState = ref('');
        const { fetchStationsByState } = useStations();

        const states = [
            { sigla: 'AC', nome: 'Acre' },
            { sigla: 'AL', nome: 'Alagoas' },
            { sigla: 'AP', nome: 'Amapá' },
            { sigla: 'AM', nome: 'Amazonas' },
            { sigla: 'BA', nome: 'Bahia' },
            { sigla: 'CE', nome: 'Ceará' },
            { sigla: 'DF', nome: 'Distrito Federal' },
            { sigla: 'ES', nome: 'Espírito Santo' },
            { sigla: 'GO', nome: 'Goiás' },
            { sigla: 'MA', nome: 'Maranhão' },
            { sigla: 'MT', nome: 'Mato Grosso' },
            { sigla: 'MS', nome: 'Mato Grosso do Sul' },
            { sigla: 'MG', nome: 'Minas Gerais' },
            { sigla: 'PA', nome: 'Pará' },
            { sigla: 'PB', nome: 'Paraíba' },
            { sigla: 'PR', nome: 'Paraná' },
            { sigla: 'PE', nome: 'Pernambuco' },
            { sigla: 'PI', nome: 'Piauí' },
            { sigla: 'RJ', nome: 'Rio de Janeiro' },
            { sigla: 'RN', nome: 'Rio Grande do Norte' },
            { sigla: 'RS', nome: 'Rio Grande do Sul' },
            { sigla: 'RO', nome: 'Rondônia' },
            { sigla: 'RR', nome: 'Roraima' },
            { sigla: 'SC', nome: 'Santa Catarina' },
            { sigla: 'SP', nome: 'São Paulo' },
            { sigla: 'SE', nome: 'Sergipe' },
            { sigla: 'TO', nome: 'Tocantins' }
        ];

        const fetchStations = () => {
            if (selectedState.value) {
                fetchStationsByState(selectedState.value, map.value);
            }
        };

        onMounted(() => {
            map.value = new Map({
                target: mapElement.value,
                layers: [
                    new TileLayer({
                        source: new OSM(),
                    }),
                ],
                view: new View({
                    center: fromLonLat([-45, -20]), // Coordenadas aproximadas do Brasil (longitude, latitude)
                    zoom: 4.7, // Nível de zoom adequado para visualizar todo o país
                }),
            });
        });

        return {
            map: mapElement,
            selectedState,
            states,
            fetchStations,
        };
    },
};
</script>

<style scoped>
.map-container {
    width: 100%;
    height: 100vh;
}
</style>