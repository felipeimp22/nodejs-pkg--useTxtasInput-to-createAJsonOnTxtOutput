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

let rowData = []
let formatedData;

const fileReadingPath = path.join('..','files', 'banner-input.txt');
const outputReadingPath = path.join('..','files', 'output.txt');

let splitedData = []
// let rawJson ={}
// let jsonFormated = jsonModel


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
        let rawSplitedData = `${await readFile()}`.split(/[\t|\n]/)

        rawSplitedData.map(e => {
            if (e.includes("\r\n")) {
                return splitedData.push(e.replace("\r", ""))
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
        for(let i=0; i<splitedData.length; i++) {     
            if( i == 22){
                rowData.push(obj)
                obj ={}
                splitedData.splice(0, i) 
                i = 0;
            }
            obj[DTO[i]] = splitedData[i]

              continue; // continue to the next iteration
          }
    }
    catch (e) {
        console.log(e.message)
        return e.message
    }
}


const createFormatedJson = async() =>{
    try {
        await createRawJson()
        let assemblingObj = jsonModel
        let bindObj = ''


        rowData.forEach((e,i, arr)=>{
            let pathImagemS3= JSON.parse(assemblingObj.pathImagemS3)
            pathImagemS3.default = pathImagemS3.default + e["Nome da Imagem"] + "-mobile" + e["Extensão"]

            let defaultMetaData = JSON.parse(assemblingObj.defaultMetaData)
            defaultMetaData["url_img"] = defaultMetaData["url_img"] + e["Nome da Imagem"]
            defaultMetaData["ext_img"] = e["Extensão"]
            defaultMetaData["TAG"] = e["TAG"]

            let defaultUrlRedirect =  JSON.parse(assemblingObj.defaultUrlRedirect)
            defaultUrlRedirect.default = e["Default"]
            defaultUrlRedirect["MCLA"] = e["Site"]
            defaultUrlRedirect["MCAP"] = e["App"]

            assemblingObj.idcampanha = e["ID"]
            assemblingObj.ativo = Boolean(e["Ativo"])
            assemblingObj.codCampanha = e["Código"]
            assemblingObj.descricao = e["Descrição"]
            assemblingObj.segmento = e["Segmento"]
            assemblingObj.prioridade = e["Prioridade"]
            assemblingObj.textoPrincipal = e["Texto Principal"]
            assemblingObj.metodo = e["Metodo"]
            assemblingObj.nomeLambda = e["Lambda"]
            assemblingObj.pathImagemS3 = JSON.stringify(pathImagemS3)
            assemblingObj.defaultMetaData = JSON.stringify(defaultMetaData)
            assemblingObj.defaultUrlRedirect = JSON.stringify(defaultUrlRedirect)

            bindObj += i != 0 && i != arr.length ? "," + JSON.stringify(assemblingObj) : JSON.stringify(assemblingObj)
        })
        formatedData = JSON.parse("[" + bindObj + "]")
    }
    catch (e) {
        console.log(e.message)
        return e.message
    } 
}


const createFile = async() =>{
    try{
        await createFormatedJson()

        const now = new Date();
        const dateString = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear().toString().padStart(4, '0')}-${now.getHours().toString().padStart(2, '0')}.${now.getMinutes().toString().padStart(2, '0')}`

        const dynamicUutputReadingPath = path.join('..','files', 'outputs', `Banner-${dateString}_output.txt`);

        // const commaValidation = await checkIfNeedCommaOnOutput()
        // if(commaValidation){
        //    await insertCommaOnOutput() 
        // }

        //caso necessario tirar os [] do arquivo:
        // formatedData.forEach()
        // para cada obj usar appendFile e voltar com o commaValidation

        const formatedOutput = JSON.stringify(formatedData, null, 2)

    //    await fs.appendFile(outputReadingPath,formatedOutput.substring(1, formatedOutput.length - 1).slice(0, -1) )
    // await fs.appendFile(outputReadingPath,formatedOutput )
    await fs.writeFile(dynamicUutputReadingPath,formatedOutput )



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


















