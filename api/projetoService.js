const mongoose = require('mongoose');

const Projeto = mongoose.model('projeto');
const Acesso = mongoose.model('acesso');
const Cliente = mongoose.model('cliente');
const Pessoa = mongoose.model('pessoa');

const projetoService = class {

    constructor(
        date_project, 
        date_aproved, 
        date_change, 
        paied, 
        auth,
        checkPost,
        checkSoli,
        checkApro,
        checkChange,
        observation,
        idPro,
        idUser,
        person,) {
            this.date_project = date_project, 
            this.date_aproved = date_aproved, 
            this.date_change = date_change, 
            this.paied = paied, 
            this.auth = auth,
            this.checkPost = checkPost,
            this.checkSoli = checkSoli,
            this.checkApro = checkApro,
            this.checkChange = checkChange,
            this.observation = observation,
            this.idPro = idPro,
            this.idUser = idUser,
            this.person = person
        }

    paiedProject() {
        console.log('projeto pago')
    };

    authProject() {
        console.log('projeto autorizado')
    };

    saveDate() {
        verifyCheck();
        fillDate();
        save();
        console.log('salvar datas projeto')
    };

    async getProject(id){
        var project = await Projeto.findById(id);
        return project;
    };

    async getClient(id){
        var client = await Cliente.findById(id);
        return client;
    };

    async getValidAccessSeller(idVendedor){
        var access = await Acesso.findOne({idVendedor, });
        return access;
    };

    async getSeller(idVendedor){
        var vendedor = await Pessoa.findById(idVendedor);
        return vendedor.nome;
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
            console.log(oldtext)
            var newtext = `[${newdate} - ${time}] por ${nome_pessoa}` + '\n' + obs + '\n' + oldtext;
            await Projeto.updateOne({ _id: id }, { $set: { obsprojetista: newtext } });
        }
    }    
}

module.exports = projetoService;