const mongoose = require('mongoose');

require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

require('../model/Projeto');
require('../model/Acesso');
require('../model/Cliente');
require('../model/Pessoa');

const naoVazio = require('../resources/naoVazio');
const dataHoje = require('../resources/dataHoje');

const Projeto = mongoose.model('projeto');
const Acesso = mongoose.model('acesso');
const Cliente = mongoose.model('cliente');
const Pessoa = mongoose.model('pessoa');

const projectFollow = class {

    constructor(
        date_project,
        date_soli,
        date_aproved,
        date_change,
        observation,
        idPro,
        idUser,
        person,) {
        this.date_project = date_project,
            this.date_soli = date_soli,
            this.date_aproved = date_aproved,
            this.date_change = date_change,
            this.observation = observation,
            this.idPro = idPro,
            this.idUser = idUser,
            this.person = person
    }

    paiedProject() {
        console.log('salvar projeto pago')
    };

    authProject() {
        console.log('salvar projeto autorizado')
    };

    async saveDate(check, dateType) {
        console.log("verifica check e datas de projeto");
        var project = await getProject(this.idPro);
        var client = await getClientName(project.cliente);
        var accessSeller = await getValidAccessSeller(project.vendedor);
        var seller = await getPeople(project.vendedor);

        console.log('dataSoli=>' + this.date_soli);

        if (dateType == 'checkSoli') {
            if (verifyCheckDB(project.dataSoli) || naoVazio(this.date_soli)) {
                commitDate(seller, project, client, 'dataSoli', this.date_soli, 'solicitada', accessSeller);
            }
            else if (check != undefined) {
                commitDate(seller, project, client, 'dataSoli', dataHoje(), 'solicitada', accessSeller);
            }
        }
        if (dateType == 'checkApro') {
            if (verifyCheckDB(project.dataApro) || naoVazio(this.date_aproved)) {
                commitDate(seller, project, client, 'dataApro', this.date_aproved, 'aprovada', accessSeller);
            }
            else if (check != undefined) {
                commitDate(seller, project, client, 'dataApro', dataHoje(), 'aprovada', accessSeller);
            }
        }
        if (dateType == 'checkTroca') {     
            if (verifyCheckDB(project.dataTroca) || naoVazio(this.date_change)) {
                commitDate(seller, project, client, 'dataTroca', this.date_change, 'substituido', accessSeller);
            }
            else if (check != undefined) {
                commitDate(seller, project, client, 'dataTroca', dataHoje(), 'substituido', accessSeller);
            }
        }
        if (dateType == 'checkPost') {
            if (verifyCheckDB(project.dataPost) || naoVazio(this.date_project)) {
                commitDate(seller, project, client, 'dataPost', this.date_project, 'postado', accessSeller);
            }
            else if (check != undefined) {
                commitDate(seller, project, client, 'dataPost', dataHoje(), 'postado', accessSeller);
            }
        }
        console.log('salvou datas projeto');
    };

    async saveObservation() {
        if (this.person != undefined){
            let people = await getPeople(this.person);
            var personName = people.nome;
        }else{
            var personName = '';
        }
        if (this.observation != '') {
            var time = String(new Date(Date.now())).substring(16, 21);
            var newdate = dataMensagem(dataHoje());
            var project = await getProject(this.idPro);
            if (naoVazio(project.obsprojetista)) {
                oldtext = project.obsprojetista;
            } else {
                oldtext = '';
            }
            commitObs(newdate, time, personName, this.observation, oldtext);
        }
    }
}

async function commitObs (newDate, time, personName, obs, oldText){
    var newtext = `[${newDate} - ${time}] por ${personName}` + '\n' + obs + '\n' + oldText;
    await Projeto.updateOne({ _id: this.idPro }, { $set: { obsprojetista: newtext } });
}

async function commitDate(seller, project, client, field, value, mescom, accessSeller) {
    if (field == 'dataSoli'){
        await Projeto.findOneAndUpdate({ _id: project._id }, { $set: {dataSoli: value} });
    }
    if (field == 'dataApro'){
        await Projeto.findOneAndUpdate({ _id: project._id }, { $set: {dataApro: value} });
    }
    if (field == 'dataTroca'){
        await Projeto.findOneAndUpdate({ _id: project._id }, { $set: {dataTroca: value} });
    }
    if (field == 'dataPost'){
        await Projeto.findOneAndUpdate({ _id: project._id }, { $set: {dataPost: value} });
    }

    // if (naoVazio(accessSeller) && naoVazio(seller.celular)) 
    //     sendMessage(seller.nome, project.seq, client.nome, seller.celular, project._id, mescom);
};

function verifyCheckDB(dataBase) {
    if (naoVazio(dataBase)) {
        return true;
    }
    return false;
};

// async function sendMessage(sellerName, seqPro, clientName, clientPhone, idPro, mescom) {
//     var mensagem = 'Olá ' + sellerName + ',' + '\n' +
//         'O projeto ' + seqPro + ' do cliente ' + clientName + ' foi ' + mescom + '.' + '\n' +
//         'Acompanhe a proposta acessando: https://integracao.vimmus.com.br/gerenciamento/orcamento/' + idPro + '.'

//     client.messages
//         .create({
//             body: mensagem,
//             from: 'whatsapp:+554991832978',
//             to: 'whatsapp:+55' + clientPhone
//         })
//         .then((message) => {
//             console.log(message)
//         }).done()
// };

async function getProject(idPro) {
    return await Projeto.findById(idPro);;
};

async function getClientName(idCliente) {
    return await Cliente.findById(idCliente);
};

async function getValidAccessSeller(idVendedor) {
    return await Acesso.findOne({ pessoa: idVendedor, notvis: 'checked' });
};

async function getPeople(idPerson) {
   return await Pessoa.findById(idPerson);
};

module.exports = projectFollow;