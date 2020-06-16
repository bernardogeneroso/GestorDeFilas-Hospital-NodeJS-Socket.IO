var porta = 3000;

const express = require('express')
const app = express()
const bcrypt = require('bcrypt') //Biblioteca para encryptação
const network = require('network')
const session = require('express-session') //Biblioteca para as sessões
const server = require('http').createServer(app)
const io = require('socket.io')(server)

var lg = require('./language.js'); // ficheiro com linguagem


const users = [ //array dos utilizadores
  {
    id: '0',
    permission: 3,
    username: 'admin',
    codigo: '$2b$10$zInScr.Avf6iPYUbVKvva.XviR0KDg5pGuLi.MU6GwqJMqgJrfaxi', //pass: admin
    gabinete: 'Admin'
  },
  {
    id: '1',
    medicoGab: '0',
    permission: 1,
    username: 'teste1',
    codigo: '$2b$10$k8KMQ8M8qONSZxhS5M7bGey2XMgbf8wYJPMHyVJKuISqCMyt8ex1K', //pass: medico
    gabinete: 'GAB1'
  },
  {
    id: '2',
    medicoGab: '1',
    permission: 1,
    username: 'teste2',
    codigo: '$2b$10$k8KMQ8M8qONSZxhS5M7bGey2XMgbf8wYJPMHyVJKuISqCMyt8ex1K', //pass: medico
    gabinete: 'GAB2'
  },
  {
    id: '3',
    medicoGab: '2',
    permission: 1,
    username: 'teste3',
    codigo: '$2b$10$k8KMQ8M8qONSZxhS5M7bGey2XMgbf8wYJPMHyVJKuISqCMyt8ex1K', //pass: medico
    gabinete: 'GAB3'
  },
  {
    id: '4',
    medicoGab: '3',
    permission: 1,
    username: 'teste4',
    codigo: '$2b$10$k8KMQ8M8qONSZxhS5M7bGey2XMgbf8wYJPMHyVJKuISqCMyt8ex1K', //pass: medico
    gabinete: 'GAB4'
  },
  {
    id: '5',
    medicoGab: '4',
    permission: 1,
    username: 'teste5',
    codigo: '$2b$10$k8KMQ8M8qONSZxhS5M7bGey2XMgbf8wYJPMHyVJKuISqCMyt8ex1K', //pass: medico
    gabinete: 'GAB5'
  },
  {
    id: '6',
    balcao: '0',
    permission: 2,
    username: 'teste6',
    codigo: '$2b$10$iVnu2qodYkEbAkxWvYLoiu157ncXaAHaCKrzrv4JQq9ylUSx.XZEa', //pass: balcao
    gabinete: 'BAL1'
  }
]
const functionarioBalcao = [
  {
    posicao: '5',
    id_user: '6',
    medicoNome: 'Camila Ramos',
    alcunha: 'BAL',
    balcao: 'BAL1',
    corBoard: '#218838',
    senha: '0',
    especialidade: '',
    senhas: 0
  }
]

const medicoGab = [ //array dos blocos
  {
    posicao: '0',
    id_user: '1',
    medicoNome: 'Miguel Reis',
    especialidade: 'CARDIOLOGIA',
    alcunha: 'CA',
    gabinete: 'GAB1',
    corBoard: '#DEB427',
    senha: '0',
    senhas: '0'
  },
  {
    posicao: '1',
    id_user: '2',
    medicoNome: 'José Miguel',
    especialidade: 'PEDIATRIA',
    alcunha: 'PE',
    gabinete: 'GAB2',
    corBoard: 'red',
    senha: '0',
    senhas: '0'
  },
  {
    posicao: '2',
    id_user: '3',
    medicoNome: 'Zé Canela',
    especialidade: 'GINECOLOGIA',
    alcunha: 'GI',
    gabinete: 'GAB3',
    corBoard: '#40BFA9',
    senha: '0',
    senhas: '0'
  },
  {
    posicao: '3',
    id_user: '4',
    medicoNome: 'João Soares',
    especialidade: 'PNEUMOLOGIA',
    alcunha: 'PN',
    gabinete: 'GAB4',
    corBoard: '#DEB427',
    senha: '0',
    senhas: '0'
  },
  {
    posicao: '4',
    id_user: '5',
    medicoNome: 'Younes Manel',
    especialidade: 'PSICOLOGIA',
    alcunha: 'PS',
    gabinete: 'GAB5',
    corBoard: 'red',
    senha: '0',
    senhas: '0'
  }
]

//var global
var id_user = 0
var username_info = ''
var ip_info = ''
var clients = 0
var somaTotalSenhaAdmin = 0
var countSenha = 0
var countSenhaGab = 0
var clienteParaSerAtentido = 0
var senhasGabinete = {}
var senhasBalcao = {}
var semSenhaBalcao
// - VarSocketImp
var jsonStrBalcao = '{"BAL1":[],"BAL2":[]}';
var jsonStrGabinete = '{"GAB1":[], "GAB2":[], "GAB3":[], "GAB4":[], "GAB5":[]}';
var listaChamadaBalcao = []
var listaChamadaGab = []
let tempoAtual = ''
//
setInterval(function() {
  let date_ob = new Date();
  let horas = date_ob.getHours();
  let minutos = date_ob.getMinutes();
  let segundos = date_ob.getSeconds();
  tempoAtual = horas + ':' + zeroPad(minutos, 2) + ':' + zeroPad(segundos, 2)
}, 1000); //
//ip server automatico
network.get_private_ip(function(err, ip) {
  ip_info = (err || ip); // err may be 'No active network interface found'.
})
/*network.get_public_ip(function(err, ip) {
  var ip = (err || ip); // err may be 'No active network interface found'.
})*/
//

//Componentes para carregamento
app.set('view-engine', 'ejs') //leitura de documentos .ejs
app.use(express.static(__dirname + '/views'));
app.use(express.urlencoded({ extended: false })) //desativar a proteção de comunicação por Chamadas(URL - POST,GET)
app.use(session({secret: 'usersInfo',saveUninitialized: true,resave: true})); //criação da sessão secreta
//

app.get('/', (req, res) => { //renderização da página index
  res.render('index.ejs', { ip: ip_info, porta: porta, medicoGab: medicoGab, permission: req.session.permission, id: id_user, empresaNome: lg.empresaNome, username: username_info, users: users, functionarioBalcao: functionarioBalcao, senhasGabinete: senhasGabinete, senhasBalcao: senhasBalcao, gabinete: req.session.gabinete, balcaoUser: req.session.balcao,  listaChamadaGab: listaChamadaGab, listaChamadaBalcao: listaChamadaBalcao, clienteParaSerAtentido: clienteParaSerAtentido, zeroPad: zeroPad, clientUpdate: clients, somaTotalSenhaAdmin: somaTotalSenhaAdmin }) //render da página index.ejs, com envio de argumentos no formato json
})

app.get('/login', (req, res) => {
  try { //no caso de acontecer um erro
    if(req.session.permission){ //verfifco se a condição é verdadeira
      res.redirect('/') //redirecione para o index
    } else {
      res.render('login.ejs', { title: lg.titulo }) //render da página login.ejs
    }
  } catch {
    res.redirect('/') //redirecione para o index
  }
})

app.post('/login', async (req, res) => {
  try { //no caso de acontecer um erro
    const username = req.body.username //name="username" | recebo este valor por POST
    var userFound = users.find(search => search.username === username) //verifico se o cliente existe por o seu nome
    var codeCompare = await bcrypt.compare(req.body.codigo, userFound.codigo) //uso a função compare da Biblioteca bcrypt, para verfificar o codigo recebido por POST, se é identico quando o mesmo esta encryptado, recebendo o valor do array users(formato json)


    if(userFound && codeCompare){ //verfifco se as condições são verdadeiras
      if(username === 'admin' && userFound.codigo === '$2b$10$zInScr.Avf6iPYUbVKvva.XviR0KDg5pGuLi.MU6GwqJMqgJrfaxi'){ // SuperAdmin Permissão especial
        req.session.permission = 3 // = | $_SESSION['permission'] = 2 | atribui permissão na sessão da mesma
        id_user = parseInt(userFound.id)
        console.log('Login: Bem vindo '+username+' | Permissão: 3')
      } else if(userFound.permission == 2) {
        req.session.permission = 2
        req.session.balcao = userFound.balcao;
        id_user = (parseInt(userFound.id) - parseInt(1))
        console.log('Login: Utilizador: '+username+' | Permissão: 2 | Balcão: '+userFound.gabinete)
      } else {
        req.session.permission = 1 // = | $_SESSION['permission'] = 1 | atribui permissão na sessão da mesma
        id_user = (parseInt(userFound.id) - parseInt(1))
        console.log('Login: Utilizador: '+username+' | Permissão: 1 | Gabinete: '+userFound.gabinete)
      }
      req.session.gabinete = userFound.gabinete;
      permission = parseInt(req.session.permission)
      username_info = username //coloque a var 'username' para uma var global
    }
    res.redirect('/') //redirecione para o index
  } catch (e) {
    req.session.permission = 0 // = | $_SESSION['permission'] = 0 | atribui permissão na sessão da mesma
    res.redirect('/') //redirecione para o index
  }
})

/*app.get('/register', (req, res) => {
  try { //no caso de acontecer um erro
    if(req.session.permission === 2){ //verifico a permissão do utilizador, só pode proseguir se o valor for dado como 2 e o mesmo tipo, neste caso int
      res.render('register.ejs', { title: lg.titulo }) //renderizar a página que esta apresentada no view
    } else {
      res.redirect('/') //redirecione para o index
    }
  } catch {
    res.redirect('/') //redirecione para o index
  }
})

app.post('/register', async (req, res) => {
  try { //no caso de acontecer um erro
    const hashedPassword = await bcrypt.hash(req.body.codigo, 10) //encrtptação da password, mesmo que o utilizador coloque o valor 'codigo' igual ao outro utilizador, o mesmo vai criar um valor diferente
    users.push({ //adiciono no array users, no formato json
      id: Date.now().toString(), //id fica marcada como a hora atual
      username: req.body.username, //recebo pelo o POST o username
      codigo: hashedPassword //atribuição do codigo já encryptado
    })
    res.redirect('/login') // redirecione para o login
  } catch {
    res.redirect('/register') // redirecione para o register
  }
  //console.log(users) //mostra na consola do servidor todos os utilizadores que estão no array users
})*/

app.get('/logout', (req, res) => { //get
  req.session.destroy((err) => { //destruiu as sessões criadas
    if(err) {
        return console.log(err); // caso aconteca um erro mostra na consola do servidor
    }
    res.redirect('/'); //redirecione para o index
  });
})

app.post('/logout', (req, res) => { //post
  req.session.destroy((err) => { //destruiu as sessões criadas
    if(err) {
        return console.log(err); // caso aconteca um erro mostra na consola do servidor
    }
    res.redirect('/'); //redirecione para o index
  });
})


//socket
const zeroPad = (num, places) => String(num).padStart(places, '0')

function isEmpty(val){
  return (val === undefined || val == null || val.length <= 0) ? true : false;
}

io.on('connection', socket => {
  //console.log(`Socket connection: ${socket.id}`);
  ++clients;
  socket.broadcast.emit('users_count', clients);

  
  socket.on('userRetirarSenha', data => {
    //escolher o balcao mais vazio
    /*var maxNumber = 0
    //console.log(functionarioBalcao[0].senhas)
    //console.log(functionarioBalcao[0][functionarioBalcao[0].length-1])

    for (i = 0; i < functionarioBalcao.length; i++) {
      if(maxNumber < functionarioBalcao[i].senhas){
        maxNumber = functionarioBalcao[i].senhas
      }
    }
    var balcaoEscolhido = {'idBalcao': 0, 'senhas':0}

    for (i = 0; i < functionarioBalcao.length; i++) {
      if(maxNumber > parseInt(functionarioBalcao[i].senhas)){
        balcaoEscolhido.senhas = functionarioBalcao[i].senhas
        balcaoEscolhido.idBalcao = i
      }
    }*/

    //balcao
    var senhaBalcao = parseInt(functionarioBalcao[0].senhas) + parseInt(1)
    var gabineteMedico = medicoGab[data].gabinete
    var especialidadeMedico = medicoGab[data].especialidade
    var balcao = functionarioBalcao[0].balcao
    if(isEmpty(senhasBalcao[balcao])){
      var senhaObject = {
        "senha": senhaBalcao,
        "especialidade": especialidadeMedico,
        "balcao": balcao,
        "medicoBalcao": data
      }
      socket.broadcast.emit('updateSenhaBalcaoPainelSenhas', senhaObject)
    }
    var somafuncSenhas = 0
    for (i = 0; i < functionarioBalcao.length; i++) {
      somafuncSenhas = parseInt(functionarioBalcao[i].senha) + parseInt(somafuncSenhas)  
    }
    if(semSenhaBalcao == 1){
      clienteParaSerAtentido = parseInt(countSenha) - parseInt(somafuncSenhas)
    } else  {
      clienteParaSerAtentido = (parseInt(countSenha)+1) - parseInt(somafuncSenhas)
    }
    socket.broadcast.emit('clienteUpdateAdmin', clienteParaSerAtentido)
    functionarioBalcao[0].senhas = senhaBalcao
    functionarioBalcao[0].especialidade = especialidadeMedico

    senhasBalcao = JSON.parse(jsonStrBalcao);
    senhasBalcao[balcao].push({"id":countSenha,"senha":senhaBalcao, "gabinete":gabineteMedico, "balcaoMedico": data, "especialidade": especialidadeMedico});
    jsonStrBalcao = JSON.stringify(senhasBalcao);
    ++countSenha
    socket.broadcast.emit('senhaUpdateAll')

    var senhaRetiradaShow = {
      senha: senhaBalcao,
      especialidade: especialidadeMedico
    }

    socket.emit('showSenhaRetirada', senhaRetiradaShow)

    console.log('Cliente retirou senha: '+especialidadeMedico+' | Senha: '+senhaBalcao+' | Hora atual: '+tempoAtual)
  });

  socket.on('medicoCheck', data => {
    
    try {
      //novo paciente
      var senha = medicoGab[parseInt(data.medicoPosition)].senha
      senha = parseInt(senha) + parseInt(1)
      medicoGab[parseInt(data.medicoPosition)].senha = senha
      var senhaNovoPaciente = {
        senha: senhasGabinete[data.gabinete][senha].senha,
        gabinete: medicoGab[parseInt(data.medicoPosition)].gabinete,
        nc: senhasGabinete[data.gabinete][senha].nc,
        np: senhasGabinete[data.gabinete][senha].np,
        a: senhasGabinete[data.gabinete][senha].a,
        s: senhasGabinete[data.gabinete][senha].s,
        e: senhasGabinete[data.gabinete][senha].e,
        c: senhasGabinete[data.gabinete][senha].c,
        cp: senhasGabinete[data.gabinete][senha].cp,
        t: senhasGabinete[data.gabinete][senha].t
      }
      console.log('O médico do gabinete '+medicoGab[parseInt(data.medicoPosition)].gabinete+ ' tem uma nova senha. Senha: '+senhasGabinete[data.gabinete][senha].senha+' | Hora atual: '+tempoAtual)
    } catch {
      medicoGab[parseInt(data.medicoPosition)].senha = parseInt(senha) - 1
      var senhaNovoPaciente = {
        senha: 'Sem senha',
        gabinete: medicoGab[parseInt(data.medicoPosition)].gabinete
      }
      console.log('O médico do gabinete '+medicoGab[parseInt(data.medicoPosition)].gabinete+ ' não tem nenhuma senha de momento.'+' | Hora atual: '+tempoAtual)
    }

    //dados do novo paciente
    socket.emit('novoPacienteUpdate', senhaNovoPaciente)
  });

  socket.on('funcionarioCheck', data => {
    var senhaMedico = parseInt(medicoGab[data.balcaoMedico].senhas) + parseInt(1)
    var gabinete = medicoGab[data.balcaoMedico].gabinete
    senhasGabinete = JSON.parse(jsonStrGabinete);
    if(isEmpty(senhasGabinete[gabinete])){
      var senhaObject = {
        "senha":senhaMedico,
        "especialidade": medicoGab[data.balcaoMedico].especialidade,
        "gabinete": gabinete,
        "nc": data.nc,
        "np": data.np,
        "a":data.a,
        "s":data.s,
        "e":data.e,
        "c":data.c,
        "cp":data.cp,
        "t":data.t
      }
      socket.broadcast.emit('updateSenhaGabPainelSenhas', senhaObject)
    }
    medicoGab[data.balcaoMedico].senhas = senhaMedico
    senhasGabinete[gabinete].push({"id":countSenhaGab,"senha":senhaMedico, "gabinete":gabinete, "nc":data.nc, "np":data.np, "a":data.a, "s":data.s, "e":data.e, "c":data.c, "cp":data.cp, "t":data.t});
    jsonStrGabinete = JSON.stringify(senhasGabinete);
    ++countSenhaGab

    var senhaRetiradaShow = {
      senha: senhaMedico,
      especialidade: medicoGab[data.balcaoMedico].especialidade
    }

    socket.emit('showSenhaRetirada', senhaRetiradaShow)

    console.log('Senha confirmada pelo balcão, a especialidade do médico será '+medicoGab[data.balcaoMedico].especialidade+ ' e a senha é '+senhaMedico+' | Hora atual: '+tempoAtual)
  });

  socket.on('funcionarioNovoClienteSend', data => {
    try {
      //novo cliente
      var balcaoFind = functionarioBalcao.findIndex(obj => obj.balcao==data.balcao);
      var senha = parseInt(functionarioBalcao[balcaoFind].senha) + parseInt(1)
      functionarioBalcao[balcaoFind].senha = senha
      var senhaNovoCliente = {
        senha: senhasBalcao[data.balcao][senha].senha,
        balcao: functionarioBalcao[balcaoFind].balcao,
        especialidade: medicoGab[senhasBalcao[data.balcao][senha].balcaoMedico].especialidade,
        medicoBalcao: senhasBalcao[data.balcao][senha].balcaoMedico
      }
      semSenhaBalcao = 0
      console.log('O funcionário do balcão '+functionarioBalcao[balcaoFind].balcao+ ' tem uma nova senha. Senha: '+senhasBalcao[data.balcao][senha].senha+' | Hora atual: '+tempoAtual)
    } catch {
      var senha = functionarioBalcao[balcaoFind].senha
      functionarioBalcao[balcaoFind].senha = parseInt(senha) - 1
      var senhaNovoCliente = {
        senha: 'Sem senha',
        balcao: functionarioBalcao[balcaoFind].balcao
      }
      semSenhaBalcao = 1
      console.log('O funcionário do balcão '+functionarioBalcao[balcaoFind].balcao+ ' não tem nenhuma senha de momento.'+' | Hora atual: '+tempoAtual)
    }
    if(clienteParaSerAtentido <= 0){
      clienteParaSerAtentido = 0
    } else {
      clienteParaSerAtentido = clienteParaSerAtentido - 1
    }
    socket.broadcast.emit('clienteUpdateAdmin', clienteParaSerAtentido)

    //dados do novo cliente
    socket.emit('novoClienteUpdateBalcao', senhaNovoCliente)
  });

  socket.on('enviarSenhaParaTodosBalcao', data => {
    listaChamadaBalcao[data.balcao] = ({
      senhaChamada: data.senha,
      posicao: parseInt(data.balcaoPosicao) - parseInt(medicoGab.length)
    })
    socket.broadcast.emit('chamarSenhaPainelPrincipalBalcao', listaChamadaBalcao[data.balcao])
    console.log('A senha chamada '+data.senha+' no balcão '+data.balcao+' | Hora atual: '+tempoAtual)
  })

  socket.on('enviarSenhaParaTodosGab', data => {
    listaChamadaGab[data.gab] = ({
      senhaChamada: data.senha,
      posicao: data.gabPosicao
    })
    socket.broadcast.emit('chamarSenhaPainelPrincipalGab', listaChamadaGab[data.gab])
    console.log('A senha chamada '+data.senha+' no gabinete '+data.balcao+' | Hora atual: '+tempoAtual)
  })
  
  socket.on('disconnect', function(){
    --clients;
    socket.broadcast.emit('users_count', clients);
  });
});

server.listen(porta, function(){
  console.log("Servidor aberto na porta %j", server.address().port);
}) //porta default: 3000