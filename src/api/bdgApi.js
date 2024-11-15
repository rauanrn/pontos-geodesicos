import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://servicodados.ibge.gov.br/api/v1/bdg',
    timeout: 1000000,
});

export const getStationsByState = async (stateSigla) => {
    try {
        const response = await apiClient.get(`/estado/${stateSigla}/estacoes`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar estações para o estado ${stateSigla}:`, error.message);
        throw error;
    }
};