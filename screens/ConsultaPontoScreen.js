import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, ActivityIndicator, FlatList,
    Platform, Modal, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; // <--- NOVO: Importa o Picker
import { Ionicons } from '@expo/vector-icons';

import {
    listarPontosPorData,
    atualizarPonto,
    deletarPonto,
    listarUsuarios // <--- NOVO: Importa a função para listar usuários
} from '../db/database';
import styles from '../Style/ConsultaPontoScreenStyle.js';

// --- DEFINIÇÕES DE PONTO (MANTIDAS) ---
const TIPOS_VALIDOS = {
    CHEGADA: 'Chegada',
    ALMOCO: 'Almoço',
    TERMINO_ALMOCO: 'Término Almoço',
    SAIDA: 'Saída',
};

const TIPO_CHAVE_MAP = {
    ...TIPOS_VALIDOS,
    'Chegada': 'CHEGADA',
    'Almoço': 'ALMOCO',
    'Término Almoço': 'TERMINO_ALMOCO',
    'Saída': 'SAIDA',
    entrada: 'CHEGADA',
    saida: 'SAIDA',
};

const tipoLabel = (tipo) => {
    return TIPOS_VALIDOS[tipo] || 'Desconhecido';
};
// ---------------------------------------

/** Helpers de Data (MANTIDOS) */
// Corrigido para evitar mutação direta:
const startOfDay = (date) => new Date(new Date(date).setHours(0, 0, 0, 0));
const endOfDay = (date) => new Date(new Date(date).setHours(23, 59, 59, 999));

const formatTime = (record) => {
    try {
        const dt = new Date(record.timestamp);
        return dt.toLocaleTimeString();
    } catch {
        return '-';
    }
};

const formatDate = (record) => {
    try {
        const dt = new Date(record.timestamp);
        return dt.toLocaleDateString();
    } catch {
        return '-';
    }
};

export default function ConsultaPontoScreen({ navigation, route }) {
    const [dataSelecionada, setDataSelecionada] = useState(new Date());
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState(null);

    const [modalVisivel, setModalVisivel] = useState(false);
    const [pontoSelecionado, setPontoSelecionado] = useState(null);
    const [horaSelecionada, setHoraSelecionada] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [novoTipo, setNovoTipo] = useState('');

    // --- ESTADOS DE RH ---
    const [todosUsuarios, setTodosUsuarios] = useState([]);
    const [usuarioVisualizado, setUsuarioVisualizado] = useState(null); // O usuário cujos pontos serão exibidos

    // O usuário que fez login
    const usuarioLogado = route?.params?.usuario;
    const isRH = usuarioLogado?.funcao === 'RH';

    // A MATRÍCULA CHAVE: Usa a do selecionado se for RH, ou a do logado se não for.
    const usuarioMatricula = isRH
        ? usuarioVisualizado?.matricula
        : usuarioLogado?.matricula;

    // NOVO: Carrega a lista de todos os usuários (apenas se for RH)
    const carregarTodosUsuarios = useCallback(async () => {
        if (!isRH) return;
        try {
            const lista = await listarUsuarios();
            setTodosUsuarios(lista || []);

            // Define o primeiro usuário como visualizado por padrão
            const defaultUser = (lista || []).find(u => u.matricula === usuarioLogado?.matricula) || lista?.[0];
            setUsuarioVisualizado(defaultUser || null);
        } catch (error) {
            console.error("Erro ao carregar lista de usuários:", error);
            Alert.alert("Erro", "Falha ao carregar lista de colaboradores para RH.");
        }
    }, [isRH, usuarioLogado?.matricula]);


    const carregarRegistros = useCallback(async () => {
        setLoading(true);
        setErro(null);

        if (!usuarioMatricula) {
            setRegistros([]);
            setLoading(false);
            return;
        }

        try {
            const dataParaConsulta = new Date(dataSelecionada);
            const inicio = startOfDay(dataParaConsulta).getTime();
            const fim = endOfDay(new Date(dataParaConsulta)).getTime();

            // Usa a matrícula DINÂMICA
            let registrosCarregados = await listarPontosPorData(usuarioMatricula, inicio, fim);
            registrosCarregados.sort((a, b) => a.timestamp - b.timestamp);

            setRegistros(registrosCarregados);
        } catch (err) {
            console.error('❌ Erro ao carregar registros:', err);
            setErro(err.message || 'Erro ao carregar registros.');
        } finally {
            setLoading(false);
        }
    }, [dataSelecionada, usuarioMatricula]);


    // Efeitos de Inicialização e Recarregamento
    useEffect(() => {
        if (isRH) {
            carregarTodosUsuarios();
        } else {
            // Se não for RH, define o usuário logado como o visualizado
            setUsuarioVisualizado(usuarioLogado);
        }
    }, [usuarioLogado, isRH, carregarTodosUsuarios]);

    useEffect(() => {
        // Dispara o carregamento sempre que a data ou a matrícula mudar
        if (usuarioMatricula) { // <-- ADICIONADO: Só carrega se a matrícula estiver definida
            carregarRegistros();
        }
    }, [dataSelecionada, usuarioMatricula, carregarRegistros]); // Mantém dependências

    // ... (restante das funções: alterarDia, voltarHoje)
    const alterarDia = (dias) => {
        const novaData = new Date(dataSelecionada);
        novaData.setDate(novaData.getDate() + dias);
        setDataSelecionada(novaData);
    };

    const voltarHoje = () => setDataSelecionada(new Date());

    const abrirModalEdicao = (ponto) => {
        let tipoChave = TIPO_CHAVE_MAP[ponto.tipo];
        if (!tipoChave || !TIPOS_VALIDOS.hasOwnProperty(tipoChave)) {
            tipoChave = TIPO_CHAVE_MAP[tipoChave] || 'CHEGADA';
        }

        setPontoSelecionado(ponto);
        setHoraSelecionada(new Date(ponto.timestamp));
        setNovoTipo(tipoChave);
        setModalVisivel(true);
    };

    const confirmarEdicao = async () => {
        if (!pontoSelecionado || !novoTipo) {
            Alert.alert("Atenção", "Selecione um tipo de ponto válido.");
            return;
        }

        // Garante que o ponto atualizado mantenha a matrícula correta (do usuário visualizado)
        const matriculaParaEdicao = usuarioMatricula || pontoSelecionado.matricula;
        if (!matriculaParaEdicao) {
            Alert.alert("Erro", "Não foi possível identificar a matrícula para atualização.");
            return;
        }

        const dataBase = new Date(pontoSelecionado.timestamp);
        dataBase.setHours(horaSelecionada.getHours(), horaSelecionada.getMinutes(), horaSelecionada.getSeconds());

        const novoTimestamp = dataBase.getTime();

        // Validação de dia (MANTIDO)
        if (novoTimestamp < startOfDay(new Date(dataSelecionada)).getTime() || novoTimestamp > endOfDay(new Date(dataSelecionada)).getTime()) {
            Alert.alert("Atenção", "A hora selecionada está fora do dia de consulta. Ajuste a hora.");
            return;
        }

        try {
            // Se seu DB usa ID único, não precisa de matrícula aqui, mas se for necessário, use:
            await atualizarPonto(pontoSelecionado.id, {
                tipo: novoTipo,
                timestamp: novoTimestamp,
                hora: dataBase.toLocaleTimeString(),
                data: dataBase.toLocaleDateString(),
                matricula: matriculaParaEdicao // Inclui a matrícula (boa prática)
            });

            setModalVisivel(false);
            setPontoSelecionado(null);
            carregarRegistros();
        } catch (err) {
            console.error('Erro ao atualizar ponto:', err);
            Alert.alert("Erro", "Não foi possível atualizar o ponto.");
        }
    };

    const confirmarExclusao = (ponto) => {
        Alert.alert(
            "Excluir Ponto",
            "Deseja realmente excluir este ponto? Essa ação não pode ser desfeita.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir", style: "destructive", onPress: async () => {
                        try {
                            // Corrigido: A função deletarPonto espera apenas o ID do ponto.
                            await deletarPonto(ponto.id);
                            carregarRegistros();
                        } catch (error) {
                            Alert.alert("Erro", "Não foi possível excluir o ponto.");
                            console.error("Erro ao excluir:", error);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        const hora = formatTime(item);
        const tipo = tipoLabel(item.tipo);
        const data = formatDate(item);

        return (
            <View style={styles.item}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.tipo}>{tipo}</Text>
                    <Text style={styles.hora}>{hora}</Text>
                    <Text style={styles.data}>{data}</Text>
                </View>

                {/* BOTÕES DE EDIÇÃO/EXCLUSÃO SÓ APARECEM PARA RH */}
                {isRH && (
                    <View style={{ flexDirection: 'row', marginTop: 5 }}>
                        <TouchableOpacity
                            style={{ padding: 8, marginRight: 10, backgroundColor: '#e3f2fd', borderRadius: 5 }}
                            onPress={() => abrirModalEdicao(item)}
                        >
                            <Text style={{ color: '#325744ff' }}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ padding: 8, backgroundColor: '#d32f2f', borderRadius: 5 }}
                            onPress={() => confirmarExclusao(item)}
                        >
                            <Text style={{ color: '#fff' }}>Excluir</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    const Conteudo = () => {
        if (loading) return <ActivityIndicator size="large" color="#759786ff" style={{ marginTop: 20 }} />;
        if (erro) return <Text style={styles.error}>Erro: {erro}</Text>;

        // NOVO: Mensagem de instrução para RH
        if (isRH && !usuarioMatricula) return <Text style={styles.empty}>Selecione um colaborador acima para visualizar os pontos.</Text>;

        if (registros.length === 0) return <Text style={styles.empty}>Nenhum registro encontrado para a data selecionada.</Text>;

        return (
            <FlatList
                data={registros}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                style={styles.list}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? 60 : 30 }}
            />
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.title}>Consulta de Pontos</Text>

                {/* NOVO: SELETOR DE USUÁRIO PARA RH */}
                {isRH && (
                    <View style={styles.selectContainer}>
                        <Text style={styles.selectLabel}>Colaborador:</Text>
                        <Picker
                            selectedValue={usuarioVisualizado?.matricula || ''}
                            onValueChange={(itemValue) => {
                                const user = todosUsuarios.find(u => u.matricula === itemValue);
                                setUsuarioVisualizado(user);
                                // O useEffect fará o recarregamento
                            }}
                            style={styles.picker}
                            enabled={!loading} // A cor do texto pode ser definida aqui também
                            // Opção de placeholder (iOS) ou ajuste de estilo (Android)
                            itemStyle={Platform.OS === 'ios' ? { height: 100, color: '#000' } : { color: '#000' }}
                        >
                            {/* Garante que o picker mostre algo mesmo que a lista esteja vazia */}
                            {todosUsuarios.length === 0 && <Picker.Item label="Carregando..." value="" />}

                            {todosUsuarios.map((u) => (
                                <Picker.Item
                                    key={u.matricula}
                                    label={`${u.nome} (${u.matricula})`}
                                    value={u.matricula}
                                />
                            ))}
                        </Picker>
                    </View>
                )}

                <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                        Colaborador: {usuarioVisualizado?.nome || usuarioLogado?.nome || 'Não identificado'}
                    </Text>
                    <Text style={styles.userName}>
                        Matrícula: {usuarioVisualizado?.matricula || usuarioLogado?.matricula || '---'}
                    </Text>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity style={styles.button} onPress={() => alterarDia(-1)}>
                        <Text style={styles.buttonText}>‹</Text>
                    </TouchableOpacity>

                    <Text style={[styles.dateText, { flex: 1, textAlign: 'center' }]}>
                        {dataSelecionada.toLocaleDateString()}
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={() => alterarDia(1)}>
                        <Text style={styles.buttonText}>›</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.rowSmall}>
                    <TouchableOpacity style={[styles.botaoHoje]} onPress={voltarHoje}>
                        <Text style={styles.textoBotao}>Hoje</Text>
                    </TouchableOpacity>
                </View>

                <Conteudo />

                {/* Modal de edição (mantido) */}
                <Modal visible={modalVisivel} transparent animationType="slide">
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <View style={{ width: 300, padding: 20, backgroundColor: '#fff', borderRadius: 8 }}>
                            <Text style={{ fontWeight: 'bold', marginBottom: 10, fontSize: 18 }}>Editar Ponto</Text>

                            <Text style={{ marginBottom: 5 }}>Ponto original: **{tipoLabel(pontoSelecionado?.tipo)}**</Text>

                            <View style={{ marginBottom: 15, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, overflow: 'hidden' }}>
                                {/* Seletor de Tipo */}
                                {Object.entries(TIPOS_VALIDOS).map(([key, label]) => (
                                    <TouchableOpacity
                                        key={key}
                                        style={[
                                            { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
                                            novoTipo === key ? { backgroundColor: '#e3f2fd' } : {}
                                        ]}
                                        onPress={() => setNovoTipo(key)}
                                    >
                                        <Text style={{ fontWeight: novoTipo === key ? 'bold' : 'normal' }}>{label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Seletor de Hora */}
                            <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                                <Text style={{ padding: 10, borderWidth: 1, borderColor: '#325744ff', borderRadius: 5, textAlign: 'center', backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>
                                    ⏰ Nova Hora: {horaSelecionada.toLocaleTimeString()}
                                </Text>
                            </TouchableOpacity>

                            {showTimePicker && (
                                <DateTimePicker
                                    value={horaSelecionada}
                                    mode="time"
                                    is24Hour={true}
                                    display={Platform.OS === 'ios' ? "spinner" : "default"}
                                    onChange={(event, selectedTime) => {
                                        setShowTimePicker(Platform.OS === 'ios');
                                        if (selectedTime) setHoraSelecionada(selectedTime);
                                    }}
                                />
                            )}

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                                <TouchableOpacity onPress={() => { setModalVisivel(false); setShowTimePicker(false); }}>
                                    <Text style={{ padding: 8, color: '#999' }}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={confirmarEdicao} style={{ backgroundColor: '#759786ff', borderRadius: 5 }}>
                                    <Text style={{ padding: 8, fontWeight: 'bold', color: '#fff' }}>Salvar Alteração</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Botão Flutuante de Voltar */}
                <TouchableOpacity
                    style={styles.botaoVoltarFlutuante}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}