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
        var seller = await getSellerInfo(project.vendedor);

        console.log('dataSoli=>' + this.date_soli);

        if (dateType == 'checkSoli') {
            if (verifyCheckDB(project.dataSoli) || naoVazio(this.date_soli)) {
                commit(seller, project, client, 'dataSoli', this.date_soli, 'solicitada', accessSeller);
            }
            else if (check != undefined) {
                commit(seller, project, client, 'dataSoli', dataHoje(), 'solicitada', accessSeller);
            }
        }
        if (dateType == 'checkApro') {
            if (verifyCheckDB(project.dataApro) || naoVazio(this.date_aproved)) {
                commit(seller, project, client, 'dataApro', this.date_aproved, 'aprovada', accessSeller);
            }
            else if (check != undefined) {
                commit(seller, project, client, 'dataApro', dataHoje(), 'aprovada', accessSeller);
            }
        }
        if (dateType == 'checkTroca') {     
            if (verifyCheckDB(project.dataTroca) || naoVazio(this.date_change)) {
                commit(seller, project, client, 'dataTroca', this.date_change, 'substituido', accessSeller);
            }
            else if (check != undefined) {
                commit(seller, project, client, 'dataTroca', dataHoje(), 'substituido', accessSeller);
            }
        }
        if (dateType == 'checkPost') {
            if (verifyCheckDB(project.dataPost) || naoVazio(this.date_project)) {
                commit(seller, project, client, 'dataPost', this.date_project, 'postado', accessSeller);
            }
            else if (check != undefined) {
                commit(seller, project, client, 'dataPost', dataHoje(), 'postado', accessSeller);
            }
        }
        console.log('salvou datas projeto');
    };

    async saveObservation(project, obs, id, person) {
        let pessoas = await Pessoa.findById(person);
        let nome_pessoa = pessoas.nome;
        if (obs != '') {
            var time = String(new Date(Date.now())).substring(16, 21);
            var newdate = dataMensagem(dataHoje());
            if (naoVazio(project.obsprojetista)) {
                oldtext = project.obsprojetista;
            } else {
                oldtext = '';
            }
            var newtext = `[${newdate} - ${time}] por ${nome_pessoa}` + '\n' + obs + '\n' + oldtext;
            await Projeto.updateOne({ _id: id }, { $set: { obsprojetista: newtext } });
        }
    }
}

async function commit(seller, project, client, field, value, mescom, accessSeller) {
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
//             req.flash('success_msg', 'Projeto atualizado com sucesso')
//             res.redirect('/gerenciamento/projeto/' + idPro)
//         }).done()
// };

async function getProject(idPro) {
    var project = await Projeto.findById(idPro);
    return project;
};

async function getClientName(idCliente) {
    var client = await Cliente.findById(idCliente);
    return client;
};

async function getValidAccessSeller(idVendedor) {
    var access = await Acesso.findOne({ pessoa: idVendedor, notvis: 'checked' });
    return access;
};

async function getSellerInfo(idVendedor) {
    var vendedor = await Pessoa.findById(idVendedor);
    return vendedor;
};

module.exports = projectFollow;