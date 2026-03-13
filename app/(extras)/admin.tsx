import { useState } from "react";
import {
View,
Text,
TextInput,
TouchableOpacity,
Alert,
StyleSheet,
ScrollView
} from "react-native";
import { supabase } from "@/lib/supabase";
import { obterIgrejaSelecionada } from "@/lib/igrejaSelecionada";

export default function AdminExtras() {

const [titulo,setTitulo] = useState("");
const [mensagem,setMensagem] = useState("");
const [loading,setLoading] = useState(false);

async function enviarAviso(){

try{

setLoading(true);

const igreja = await obterIgrejaSelecionada();

if(!igreja?.id){
Alert.alert("Erro","Igreja não identificada");
return;
}

const igrejaId = igreja.id;

if(!titulo.trim() || !mensagem.trim()){
Alert.alert("Aviso","Preencha título e mensagem");
return;
}

const { error } = await supabase
.from("avisos")
.insert({
igreja_id: igrejaId,
titulo: titulo,
mensagem: mensagem
});

if(error){
Alert.alert("Erro",error.message);
return;
}

/* ENVIA PUSH */
await supabase.functions.invoke("send-push-igreja",{
body:{
igreja_id: igrejaId,
titulo: titulo,
mensagem: mensagem
}
});

Alert.alert("Sucesso","Aviso publicado");

setTitulo("");
setMensagem("");

}catch(e:any){

Alert.alert("Erro",e.message);

}finally{

setLoading(false);

}

}

return(

<ScrollView style={styles.container}>

<Text style={styles.title}>
Admin Avisos (Extra)
</Text>

<View style={styles.card}>

<Text style={styles.label}>Título</Text>

<TextInput
style={styles.input}
placeholder="Título do aviso"
value={titulo}
onChangeText={setTitulo}
/>

<Text style={styles.label}>Mensagem</Text>

<TextInput
style={[styles.input,{height:120}]}
placeholder="Mensagem do aviso"
value={mensagem}
multiline
onChangeText={setMensagem}
/>

<TouchableOpacity
style={styles.button}
onPress={enviarAviso}
disabled={loading}
>

<Text style={styles.buttonText}>
{loading ? "Enviando..." : "Publicar aviso"}
</Text>

</TouchableOpacity>

</View>

</ScrollView>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#f3f4f6",
padding:20
},

title:{
fontSize:26,
fontWeight:"800",
marginBottom:20
},

card:{
backgroundColor:"#fff",
padding:20,
borderRadius:14
},

label:{
fontSize:14,
marginBottom:6
},

input:{
borderWidth:1,
borderColor:"#ddd",
borderRadius:10,
padding:10,
marginBottom:14
},

button:{
backgroundColor:"#065f46",
padding:14,
borderRadius:10,
alignItems:"center"
},

buttonText:{
color:"#fff",
fontWeight:"700"
}

});
