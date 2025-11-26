import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, Alert, TouchableOpacity, Image
} from 'react-native';
import * as Location from 'expo-location';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
    registrarPonto, listarPontos
} from '../db/database';
import styles from '../Style/PontoScreenStyle.js';


const ordem = ['CHEGADA', 'ALMOCO', 'TERMINO_ALMOCO', 'SAIDA'];
const labels = {
    CHEGADA: 'Registrar Chegada',
    ALMOCO: 'Registrar Almoço',
    TERMINO_ALMOCO: 'Registrar Término',
    SAIDA: 'Registrar Saída'
};

    
const labelsHistorico = {
    CHEGADA: 'Chegada',
    ALMOCO: 'Almoço',
    TERMINO_ALMOCO: 'Término Almoço',
    SAIDA: 'Saída'
}

const calcularProximoTipo = (ultimoRegistro) => {
    if (!ultimoRegistro || !ultimoRegistro.tipo || ordem.indexOf(ultimoRegistro.tipo) === -1) {
        return { tipo: 'CHEGADA', label: labels.CHEGADA };
    }
    
    const idx = ordem.indexOf(ultimoRegistro.tipo);
    
    if (idx >= 0 && idx < ordem.length - 1) {
        const proximoTipo = ordem[idx + 1];
        return { tipo: proximoTipo, label: labels[proximoTipo] };
    }
    
    
    return { tipo: null, label: "Jornada Finalizada" };
};
    


export default function PontoScreen({ navigation, route }) {
    const [hora, setHora] = useState('');
    const [data, setData] = useState('');
    const [localizacao, setLocalizacao] = useState(null);
    const [ultimoRegistro, setUltimoRegistro] = useState(null);
    const [registrosHoje, setRegistrosHoje] = useState([]);

    const [isRegistering, setIsRegistering] = useState(false);
    const [cameraVisible, setCameraVisible] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);

    const isSameDay = (dataString, dateObj) => {
        if (!dataString) return false;
     
        const [dia, mes, ano] = dataString.split("/").map(Number); 
        return ano === dateObj.getFullYear() && (mes - 1) === dateObj.getMonth() && dia === dateObj.getDate();
    };

    useEffect(() => {
        const atualizarDataHora = () => {
            const agora = new Date();
            setHora(agora.toLocaleTimeString());
            setData(agora.toLocaleDateString());
        };

        const intervalId = setInterval(atualizarDataHora, 1000); 
        
        atualizarDataHora();
        carregarUltimoRegistro();

        return () => clearInterval(intervalId); 
    }, []); 

    const carregarUltimoRegistro = async (uid = null) => {
        try {
     
            const targetId = uid || route?.params?.usuario?.matricula;
            if (!targetId) return; 

            const registros = await listarPontos(targetId);
            const hoje = new Date();
            const registrosDoDia = (registros || [])
                .filter(r => r.data && isSameDay(r.data, hoje))
                .sort((a, b) => a.timestamp - b.timestamp);

            setRegistrosHoje(registrosDoDia);
            setUltimoRegistro(registrosDoDia.at(-1) || null);
        } catch (error) {
            console.error("Erro ao carregar registros:", error);
        }
    };

    const registrarPontoFunc = async () => {
        if (isRegistering || cameraVisible) return;
        try {
            setIsRegistering(true);
            
            const { tipo, label } = calcularProximoTipo(ultimoRegistro);
            if (tipo === null) {
                Alert.alert("Atenção", "Jornada já finalizada.");
                setIsRegistering(false);
                return;
            }

            const { status: camStatus } = await requestPermission();
            if (camStatus !== 'granted') {
                Alert.alert('Permissão negada', 'É necessário permitir o uso da câmera.');
                setIsRegistering(false);
                return;
            }

            setCameraVisible(true);


            (async () => {
                try {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status === 'granted') {
                        const { coords } = await Location.getCurrentPositionAsync({ maximumAge: 10000, timeout: 5000 });
                        setLocalizacao(coords);
                    }
                } catch (err) {
                    console.warn('Erro obtendo localização:', err.message || err);
                }
            })();

        } catch (e) {
            console.error('Erro em registrarPontoFunc:', e);
            Alert.alert('Erro', e.message || 'Falha ao iniciar registro.');
        } finally {
            setIsRegistering(false);
        }
    };

    const tirarFoto = async () => {
        if (!cameraRef.current) return;
        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });
            setPhotoPreview(photo);
        } catch (err) {
            console.error('Erro ao tirar foto:', err);
            Alert.alert('Erro', 'Falha ao tirar foto.');
        }
    };

    const salvarFoto = async () => {

        const matricula = route?.params?.usuario?.matricula;
        if (!matricula) return; 

        try {

            const { tipo: proximoTipoASalvar } = calcularProximoTipo(ultimoRegistro);
            
            if (proximoTipoASalvar === null) {
                Alert.alert("Erro de Sequência", "Jornada já finalizada.");
                return;
            }

            await registrarPonto(matricula, proximoTipoASalvar); 
            
            setCameraVisible(false);
            setPhotoPreview(null);
            
            await carregarUltimoRegistro(matricula); 

        } catch (err) {
            console.error('Erro ao salvar foto/ponto:', err);
            Alert.alert('Erro', 'Falha ao salvar ponto.');
        }
    };

    const { label: proximoLabel } = calcularProximoTipo(ultimoRegistro);

    if (cameraVisible) {
        if (!permission?.granted) return <Text>Solicitando permissão da câmera...</Text>;

        return (
            <View style={{ flex: 1, backgroundColor: 'black' }}>
                {photoPreview ? (
                    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                        {/*  */}
                        <Image source={{ uri: photoPreview.uri }} style={{ width: 300, height: 400, borderRadius: 10 }} />
                        <View style={{ flexDirection: 'row', marginTop: 20 }}>
                            <TouchableOpacity onPress={() => setPhotoPreview(null)} style={{ backgroundColor: 'orange', padding: 15, borderRadius: 10, marginRight: 10 }}>
                                <Text style={{ color: '#fff' }}>Tirar outra</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={salvarFoto} style={{ backgroundColor: 'green', padding: 15, borderRadius: 10 }}>
                                <Text style={{ color: '#fff' }}>Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <>
                        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front" />
                        <TouchableOpacity
                            onPress={tirarFoto}
                            style={{ backgroundColor: '#fff', padding: 20, borderRadius: 50, alignSelf: 'center', position: 'absolute', bottom: 40 }}>
                            <Text>📸</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { setCameraVisible(false); setPhotoPreview(null); }}
                            style={{ position: 'absolute', top: 40, left: 20, padding: 8 }}>
                            <Text style={{ color: '#fff' }}>Cancelar</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Registro de Ponto</Text>
            <Text style={styles.info}>Data: {data}</Text> 
            <Text style={styles.info}>Hora: {hora}</Text>

            <View style={styles.ultimoRegistro}>
                <Text style={styles.ultimoRegistroTitle}>Registros de Hoje:</Text>
                {registrosHoje.length === 0 ? (
                    <Text style={styles.ultimoRegistroInfo}>Nenhum registro hoje.</Text>
                ) : (
                    registrosHoje.map((r, i) => (
                        <View key={`${r.tipo}_${i}`} style={styles.registroContainer}>
                            <Text style={styles.ultimoRegistroInfo}>{labelsHistorico[r.tipo] || r.tipo} - {r.hora}</Text>
                        </View>
                    ))
                )}
            </View>
            
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, 
                        proximoLabel === "Jornada Finalizada" ? styles.buttonFinalizado : styles.buttonPrimary,
                        isRegistering && styles.buttonDisabled]}
                    onPress={registrarPontoFunc}
                    disabled={proximoLabel === "Jornada Finalizada" || isRegistering}
                >
                    <Text style={styles.buttonText}>{proximoLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.buttonSecondary]}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.buttonText}>Voltar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}