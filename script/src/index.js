const fs = require("fs").promises
const path = require( "path")
// const {DTO,jsonModel} = require("./dto.js")

const DTO =  [
    "row",
    "STATUS",
    "Prioridade",
    "ID",
    "Ativo",
    "Código",
    "Texto Principal",
    "Descrição",
    "Nome da Imagem",
    "Extensão",
    "Redirect",
    "Segmento",
    "TAG",
    "Metodo",
    "Lambda",
    "Default",	
    "Site",
    "App",
    "Titulo",
    "Texto1",
    "Texto2",
    "Vitrine"
]

const jsonModel = {
"idcampanha":"",
"ativo":true,
"codCampanha":"",
"defaultMetaData": "{  \"url_img\": \"https://assets.clarobrasil.mobi/ecommerce-config/sales-deck/\", \"ext_img\": \"\", \"redirect\": \"externo\", \"TITULO\": \"\", \"TEXTO_1\": \"\", \"TEXTO_2\": \"\", \"TIPO_VITRINE\": \"\", \"TAG\": \"banner:\"}",
"defaultUrlRedirect": "{ \"default\": \"\", \"MCLA\": \"\", \"MCAP\": \"\"}",
"descricao": "",
"segmento":"",
"nome": "",
"pathImagemS3": "{ \"default\": \"sales_deck/\"}",
"prioridade":1,
"textoPrincipal": "",
"textoSecundario": "",
"metodo": "",
"nomeLambda": "",
"tipo": "banners_deck"
}


const fileReadingPath = path.join('..','files', 'example.txt');
const outputReadingPath = path.join('..','files', 'output.txt');

let splitedData = []
let rawJson ={}
let jsonFormated = jsonModel

const readFile = async () => {
    try {
        const rawData = await fs.readFile(fileReadingPath, 'utf8');

        return rawData

    } catch (e) {
        console.log(e.message)
        return e.message
    }
}

const splitDataFnc = async () => {
    try {
        await readFile()
        let rawSplitedData = `${await readFile()}`.split("\t")

        rawSplitedData.map(e => {
            if (e.includes("\r\n")) {
                return splitedData.push(e.replace("\r\n", ""))
            }
            return splitedData.push(e)
        })
    } catch (e) {
        return e.message
    }
}

const createRawJson = async () => {
    try {
        await splitDataFnc()
        let obj = {}
        DTO.map((e,i)=>obj[e]= splitedData[i])
        rawJson = obj
    }
    catch (e) {
        console.log(e.message)
        return e.message
    }
}

const createFormatedJson = async() =>{
    try {
        await createRawJson()
        let pathImagemS3= JSON.parse(jsonFormated.pathImagemS3)
        pathImagemS3.default = pathImagemS3.default + rawJson["Nome da Imagem"] + "-mobile" + rawJson["Extensão"]

        let defaultMetaData = JSON.parse(jsonFormated.defaultMetaData)
        defaultMetaData["url_img"] = defaultMetaData["url_img"] + rawJson["Nome da Imagem"]
        defaultMetaData["ext_img"] = rawJson["Extensão"]
        defaultMetaData["TAG"] = rawJson["TAG"]

        let defaultUrlRedirect =  JSON.parse(jsonFormated.defaultUrlRedirect)
        defaultUrlRedirect.default = rawJson["Default"]
        defaultUrlRedirect["MCLA"] = rawJson["Site"]
        defaultUrlRedirect["MCAP"] = rawJson["App"]

        jsonFormated.idcampanha = rawJson["ID"]
        jsonFormated.ativo = Boolean(rawJson["Ativo"])
        jsonFormated.codCampanha = rawJson["Código"]
        jsonFormated.descricao = rawJson["Descrição"]
        jsonFormated.segmento = rawJson["Segmento"]
        jsonFormated.prioridade = rawJson["Prioridade"]
        jsonFormated.textoPrincipal = rawJson["Texto Principal"]
        jsonFormated.metodo = rawJson["Metodo"]
        jsonFormated.nomeLambda = rawJson["Lambda"]
        // jsonFormated.pathImagemS3 = `{\"default\": \"${pathImagemS3.default +  rawJson["Nome da Imagem"] + "-mobile" + rawJson["Extensão"]}\"}`
        jsonFormated.pathImagemS3 = JSON.stringify(pathImagemS3)
        jsonFormated.defaultMetaData = JSON.stringify(defaultMetaData)
        jsonFormated.defaultUrlRedirect = JSON.stringify(defaultUrlRedirect)

        // console.log(JSON.stringify(jsonFormated))
        // console.log(jsonFormated)
    }
    catch (e) {
        console.log(e.message)
        return e.message
    } 
}

const checkIfNeedCommaOnOutput = async() => {
    try{
    const rawOutput = await fs.readFile(outputReadingPath, 'utf8');
    return rawOutput.length > 0 && true
    } catch (e) {
        return e.message
    } 
}

const insertCommaOnOutput = async() =>{
    try{

       await fs.appendFile(outputReadingPath,", \n" )

    }catch (e) {
        return e.message
    } 

}

const createFile = async() =>{
    try{
        await createFormatedJson()
        const commaValidation = await checkIfNeedCommaOnOutput()
        if(commaValidation){
           await insertCommaOnOutput() 
        }
        const formatedOutput = JSON.stringify(jsonFormated, null, 2)

       await fs.appendFile(outputReadingPath,formatedOutput )

    }catch (e) {
        console.log(e.message)
        return e.message
    } 

} 

(async ()=> {
    console.time("Processing");
    console.log("starting processing")
    await createFile()
    console.log("finishing processing")
    console.timeEnd("Processing");

})()