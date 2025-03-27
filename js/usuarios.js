let usuarios = []
let usuario = {}
let itensInventorio = []
let itensAll = []
let itemSelecionado = {}
let avatar = 1

//armas e equipamentos
let arma = {}
let roupa = {}
let escudo = {}
let acessorio = {}
let chapeu = {}

let atkAdd = 0
let defAdd = 0

function abrirUsuarios(){
    buscarBase('usuarios')

    includeHTML()
    document.getElementById('audioBGM').play()
}

function abrirPerfil(){
    buscarBase('perfil')

    includeHTML()
}

function buscarBase(screen){
    usuario = JSON.parse(localStorage.aventureiro);
    fetch(
        'get_json.php'
    )
    .then((res) => {
        return res.json();
    })
    .then((db) => {
        db = db.db
        usuario =  db.usuarios.find(x => x.id == usuario.id)
        usuario.senha = undefined
        usuarios = db.usuarios;
        avatar = usuario.avatar
        audioConfirm()
        document.getElementById('quantidadeCoinsUser').innerHTML = usuario.bravecoins;
        if(screen == 'usuarios'){
            buscarUsuarios()
        }else{
            document.getElementById('perfilNome').innerHTML = usuario.nome + ' <i>nv. ' + usuario.nivel + '</i>';
            document.getElementById('perfilAvatar').innerHTML = `<img  src="img/face/${usuario.avatar}.png" alt="face" />`
            document.getElementById('perfilNomeInput').value = usuario.nome;

            itensAll = []
            itensAll = db.pocoes.concat(db.equipamentos, db.objetos)
            itensInventorio = []

            for(let i = 0; i < usuario.itens.length; i++){
                let it = itensAll.find(x => x.id == usuario.itens[i].id)
                if(it != undefined){
                    it.qtd = usuario.itens[i].qtd
                    it.equipado = usuario.itens[i].equipado
                    itensInventorio.push(it)
                }
            }
            renderItensIventario()
            setAtributes()
        }
    })
    .catch((err) => {
        console.error(err);
    });
}

function filtrar(){
    let nome = document.getElementById('filtroNome').value;
    let tipo = document.getElementById('filtroTipo').value;
    renderItensIventario(nome, tipo)
}

function renderItensIventario(nome, tipo){
    let html = ''
    for(let i = 0; i < itensInventorio.length; i++){
        if(itensInventorio[i].tipo == 2 && itensInventorio[i].equipado == true){
            switch (itensInventorio[i].subtipo){
                case 'arma':
                    desequiparArma()
                    itensInventorio[i].equipado = true
                    arma = itensInventorio[i]
                    break;
                case 'escudo':
                    desequiparEscudo()
                    itensInventorio[i].equipado = true
                    escudo = itensInventorio[i]
                    break;
                case 'roupa':
                    desequiparRoupa()
                    itensInventorio[i].equipado = true
                    roupa = itensInventorio[i]
                    break;
                case 'chapeu':
                    desequiparChapeu()
                    itensInventorio[i].equipado = true
                    chapeu = itensInventorio[i]
                    break;
                default:
                    desequiparAcessorio()
                    itensInventorio[i].equipado = true
                    acessorio = itensInventorio[i]
            }
        }else{
            if((nome == undefined || nome.length <= 0 || itensInventorio[i].nome.indexOf(nome) > 0) &&
                (tipo == undefined || tipo == 0 || itensInventorio[i].tipo == tipo) && itensInventorio[i].qtd > 0){
                    html += templateItemIventario(itensInventorio[i])
                }
        }
    }
    document.getElementById('listaInventario').innerHTML = html;
    renderItensEquipados()
}

function buscarUsuarios(){
    let htmlCode = ''
    for(let i = 0; i < usuarios.length; i++){
        htmlCode += templateUser(usuarios[i])
    }
    audioConfirm()
    document.getElementById('titleTypeItem').innerHTML = 'Usuários'
    document.getElementById('listaUsers').innerHTML = htmlCode
}

function abrirItem(id){
    audioConfirm()
    let item = itensAll.find(x => x.id == id)
    itemSelecionado = item;
    document.getElementById('descricaoItem').innerHTML = templateDescricaoItem(item)
}

function equiparItem(){
    for(let i = 0; i < itensInventorio.length; i++){
        if(itensInventorio[i].id == itemSelecionado.id){
            if(itensInventorio[i].classe == undefined || itensInventorio[i].classe == usuario.classe){
                itensInventorio[i].equipado = true;
                document.getElementById('descricaoItem').innerHTML = ''
                renderItensIventario()
                audioEquipar()
            }else{
                audioError()
            }
            return;
        }else if(itensInventorio[i].tipo == itemSelecionado.tipo && itensInventorio[i].subtipo == itemSelecionado.subtipo){
            itensInventorio[i].equipado = false;
        }
    }
}

function desequiparArma(){
    arma = {}
    for(let i = 0; i < itensInventorio.length;i++){
        if(itensInventorio[i].tipo == 2 && itensInventorio[i].subtipo == 'arma' &&
           itensInventorio[i].equipado == true) itensInventorio[i].equipado = undefined
    }
    for(let i = 0; i < usuario.itens.length;i++){
        if(usuario.itens[i].tipo == 2 && usuario.itens[i].subtipo == 'arma' &&
           usuario.itens[i].equipado == true) usuario.itens[i].equipado = undefined
    }
}

function desequiparEscudo(){
    escudo = {}
    for(let i = 0; i < itensInventorio.length;i++){
        if(itensInventorio[i].tipo == 2 && itensInventorio[i].subtipo == 'escudo' &&
           itensInventorio[i].equipado == true){
               itensInventorio[i].equipado = undefined
           }
    }
    for(let i = 0; i < usuario.itens.length;i++){
        if(usuario.itens[i].tipo == 2 && usuario.itens[i].subtipo == 'escudo' &&
           usuario.itens[i].equipado == true){
               usuario.itens[i].equipado = undefined
           }
    }
}

function desequiparRoupa(){
    roupa = {}
    for(let i = 0; i < itensInventorio.length;i++){
        if(itensInventorio[i].tipo == 2 && itensInventorio[i].subtipo == 'roupa' &&
           itensInventorio[i].equipado == true){
            itensInventorio[i].equipado = undefined
        }
    }
    for(let i = 0; i < usuario.itens.length;i++){
        if(usuario.itens[i].tipo == 2 && usuario.itens[i].subtipo == 'roupa' &&
           usuario.itens[i].equipado == true){
            usuario.itens[i].equipado = undefined
        }
    }
}

function desequiparAcessorio(){
    acessorio = {}
    for(let i = 0; i < itensInventorio.length;i++){
        if(itensInventorio[i].tipo == 2 && itensInventorio[i].subtipo == 'acessorio' &&
           itensInventorio[i].equipado == true){
            itensInventorio[i].equipado = undefined
        }
    }
    for(let i = 0; i < usuario.itens.length;i++){
        if(usuario.itens[i].tipo == 2 && usuario.itens[i].subtipo == 'acessorio' &&
           usuario.itens[i].equipado == true){
            usuario.itens[i].equipado = undefined
        }
    }
}

function desequiparChapeu(){
    chapeu = {}
    for(let i = 0; i < itensInventorio.length;i++){
        if(itensInventorio[i].tipo == 2 && itensInventorio[i].subtipo == 'chapeu' &&
           itensInventorio[i].equipado == true){
            itensInventorio[i].equipado = undefined
        }
    }
    for(let i = 0; i < usuario.itens.length;i++){
        if(usuario.itens[i].tipo == 2 && usuario.itens[i].subtipo == 'chapeu' &&
           usuario.itens[i].equipado == true){
            usuario.itens[i].equipado = undefined
        }
    }
}

function salvarPerfil(){
    usuario.nome = document.getElementById('perfilNomeInput').value;
    if(usuario.nome.length < 3){
        audioError()
        alert('Nome muito curto')
        return;
    }
    usuario.avatar = avatar;
    for(let i = 0; i < usuario.itens.length; i++){
        let itemEmQuestao = itensInventorio.find(x => x.id == usuario.itens[i].id)
        //Tipo equipamento
        if(itemEmQuestao.tipo == 2){
            //Equipar Arma
            if(itemEmQuestao.subtipo == 'arma' && usuario.itens[i].id == arma.id){
                usuario.itens[i].equipado = true
            }else if(itemEmQuestao.subtipo == 'arma'){
                usuario.itens[i].equipado = false
            }
            //Equipar Escudo
            if(itemEmQuestao.subtipo == 'escudo' && usuario.itens[i].id == escudo.id){
                usuario.itens[i].equipado = true
            }else if(itemEmQuestao.subtipo == 'escudo'){
                usuario.itens[i].equipado = false
            }
            //Equipar Roupa
            if(itemEmQuestao.subtipo == 'roupa' && usuario.itens[i].id == roupa.id){
                usuario.itens[i].equipado = true
            }else if(itemEmQuestao.subtipo == 'roupa'){
                usuario.itens[i].equipado = false
            }
            //Equipar Chapeu
            if(itemEmQuestao.subtipo == 'chapeu' && usuario.itens[i].id == chapeu.id){
                usuario.itens[i].equipado = true
            }else if(itemEmQuestao.subtipo == 'chapeu'){
                usuario.itens[i].equipado = false
            }
            //Equipar Acessorio
            if(itemEmQuestao.subtipo == 'acessorio' && usuario.itens[i].id == acessorio.id){
                usuario.itens[i].equipado = true
            }else if(itemEmQuestao.subtipo == 'acessorio'){
                usuario.itens[i].equipado = false
            }
        }
    }
    audioConfirm()
    salvarUsuarioBanco(usuario)
    alert('Perfil salvo com Sucesso')
}

function filtrarUsers(){
    let nome = document.getElementById('filtroNome').value;
    let itens = usuarios.filter(x => {
        return (x.nome.indexOf(nome) >= 0)
    })

    if(itens.length <= 0){
        document.getElementById('titleTypeItem').innerHTML = 'Opss!'
        document.getElementById('listaUsers').innerHTML = '<div class="text-center m-5">Nenhum resultado encontrado</div>'
        audioError()
        return;
    }

    let htmlCode = ''
    for(let i = 0; i < itens.length; i++){
        htmlCode += templateUser(itens[i])
    }
    audioConfirm()
    document.getElementById('titleTypeItem').innerHTML = nome
    document.getElementById('listaUsers').innerHTML = htmlCode
}

function setAtributes(){
    document.getElementById('atributos').innerHTML = 
     `  <b>ATK: </b> ${usuario.atk}  +  <i class="${atkAdd > 0 ? 'colorGreen' : ''}">${atkAdd}</i><br />
        <b>DEF: </b> ${usuario.def}  +  <i class="${defAdd > 0 ? 'colorGreen' : ''}">${defAdd}</i>`
}

function templateUser(user){
    return `<div class="itemUsuario">
                <div class="itemUsuario-nome">${user.nome}</div>
                <div><img  src="img/face/${user.avatar}.png" alt="face" /></div>
                <div class="itemUsuario-nv"><i>nv. ${user.nivel}</i></div>
                <div class="itemUsuario-classe"><i>${user.classe}</i></div>
            </div>`
}

function templateItemIventario(item){
    return `<div class="itemUsuario">
                <div class="itemUsuario-nome">${item.nome} <i>x${item.qtd}</i></div>
                <div><img class="iventario-item-imagem" src="img/itens/${item.icone}.png" alt="face" /></div>
                <div class="itemUsuario-nv"><i>${item.efeito}</i></div>
                <button class="button-laranja" onclick="abrirItem(${item.id})">Ver detalhes</button>
            </div>`
}

function renderMelhoriaAtributos(id){
    itemEmQuestao = itensAll.find(x => x.id == id);
    if(itemEmQuestao.tipo == 2){
        let atkMelhorado = 0
        let defMelhorada = 0
        if(itemEmQuestao.subtipo == 'arma'){
            if(arma == undefined || arma.nome == undefined){
                atkMelhorado = itemEmQuestao.atk
                defMelhorada = itemEmQuestao.def
            }else{
                atkMelhorado =  itemEmQuestao.atk - arma.atk
                defMelhorada =  itemEmQuestao.def - arma.def
            }
        }
        if(itemEmQuestao.subtipo == 'escudo'){
            if(escudo == undefined || escudo.nome == undefined){
                atkMelhorado = itemEmQuestao.atk
                defMelhorada = itemEmQuestao.def
            }else{
                atkMelhorado = itemEmQuestao.atk - escudo.atk 
                defMelhorada =  itemEmQuestao.def - escudo.def
            }
        }
        if(itemEmQuestao.subtipo == 'roupa'){
            if(roupa == undefined || roupa.nome == undefined){
                atkMelhorado = itemEmQuestao.atk
                defMelhorada = itemEmQuestao.def
            }else{
                atkMelhorado =  itemEmQuestao.atk - roupa.atk
                defMelhorada =  itemEmQuestao.def - roupa.def
            }
        }
        if(itemEmQuestao.subtipo == 'acessorio'){
            if(acessorio == undefined || acessorio.nome == undefined){
                atkMelhorado = itemEmQuestao.atk
                defMelhorada = itemEmQuestao.def
            }else{
                atkMelhorado = itemEmQuestao.atk - acessorio.atk 
                defMelhorada = itemEmQuestao.def - acessorio.def 
            }
        }
        if(itemEmQuestao.subtipo == 'chapeu'){
            if(chapeu == undefined || chapeu.nome == undefined){
                atkMelhorado = itemEmQuestao.atk
                defMelhorada = itemEmQuestao.def
            }else{
                atkMelhorado =  itemEmQuestao.atk - chapeu.atk
                defMelhorada = itemEmQuestao.def - chapeu.def 
            }
        }
        return `<div>
                ATK   ${atkMelhorado >= 0 ? `<i class='colorGreen'>+${atkMelhorado}</i>` : `<i class='colorRed'>${atkMelhorado}</i>`}<br />
                DEF   ${defMelhorada >= 0 ? `<i class='colorGreen'>+${defMelhorada}</i>` : `<i class='colorRed'>${defMelhorada}</i>`}
                </div>`
    }else{
        return ``
    }
}

function templateDescricaoItem(item){
    return `<div class="lmd-header">
                ${item.nome}
            </div>
            <div class="item-descricao-body">
                <img src="img/itens/${item.icone}.png" alt="logo" class="descricao-item-image" />
                <div class="estrelas-container">${renderStar(item.avaliacao)}</div>
                <span>${item.descricao}</span>
                <hr />
                ${item.classe != undefined ? `<span>Classe: <b class="${item.classe != usuario.classe ? 'colorRed' : ''}">${item.classe}</b></span>` : ''}
                <i>${item.efeito}</i>
                ${item.tipo == 2 ? '<hr />' : ''}
                ${renderMelhoriaAtributos(item.id)}
                <div class="item-descricao-footer text-right">
                    ${item.tipo == 1 && item.usavelEmBatalha != true ? `<button class="button-azul" onclick="${item.acao}(${item.id})">
                        Usar
                    </button>` : 
                     item.tipo == 2 ? `<button class="button-azul" onclick="equiparItem()">
                        Equipar
                    </button>` :
                    ``}
                </ div>
            </div>`
}

function templateItemEquipado(item){
    return `<div class="loja-item" onmouseover="audioCursor()" onclick="abrirProduto(${item.id})">
        <img src="img/icons/${item.icone}.png" alt="logo" />
        <span>${item.nome}  x${item.qtd}</span>
        <div class="item-preco">
            <img src="img/icons/moeda.png" alt="logo" /> ${item.preco / 10}
        </div>
    </div>`
}

function renderItensEquipados(){
    let html = ''
    atkAdd = 0
    defAdd = 0
    //Arma
    if(arma && arma.nome != undefined){
        html += `<div id="arma" class="item-equipado" onclick="desequiparArma(); renderItensIventario(); audioCancel()">
                    <img src="img/icons/${arma.icone}.png" alt="logo" class="item-equipado-imagem" />
                    <span>${arma.nome}</span>
                </div>`
        atkAdd += arma.atk;
        defAdd += arma.def;
    }else{
        html += `<div id="arma" class="item-equipado">
                    <img src="img/icons/espada.png" alt="logo" class="item-equipado-imagem item-equipado-disable" />
                    <span>Nada</span>
                </div>`
    }
    //Escudo
    if(escudo && escudo.nome != undefined){
        html += `<div id="arma" class="item-equipado" onclick="desequiparEscudo(); renderItensIventario(); audioCancel()">
                    <img src="img/icons/${escudo.icone}.png" alt="logo" class="item-equipado-imagem" />
                    <span>${escudo.nome}</span>
                </div>`
                atkAdd += escudo.atk;
                defAdd += escudo.def;
    }else{
        html += `<div id="escudo" class="item-equipado">
                    <img src="img/icons/escudo.png" alt="logo" class="item-equipado-imagem item-equipado-disable" />
                    <span>Nada</span>
                </div>`
    }
    //Chapeu
    if(chapeu && chapeu.nome != undefined){
        html += `<div id="chapeu" class="item-equipado" onclick="desequiparChapeu(); renderItensIventario(); audioCancel()">
                    <img src="img/icons/${chapeu.icone}.png" alt="logo" class="item-equipado-imagem" />
                    <span>${chapeu.nome}</span>
                </div>`
                atkAdd += chapeu.atk;
                defAdd += chapeu.def;
    }else{
        html += `<div id="chapeu" class="item-equipado">
                    <img src="img/icons/chapeuSimples.png" alt="logo" class="item-equipado-imagem item-equipado-disable" />
                    <span>Nada</span>
                </div>`
    }
    //Roupa
    if(roupa && roupa.nome != undefined){
        html += `<div id="arma" class="item-equipado" onclick="desequiparRoupa(); renderItensIventario(); audioCancel()">
                    <img src="img/icons/${roupa.icone}.png" alt="logo" class="item-equipado-imagem" />
                    <span>${roupa.nome}</span>
                </div>`
                atkAdd += roupa.atk;
                defAdd += roupa.def;
    }else{
        html += `<div id="roupas" class="item-equipado">
                    <img src="img/icons/roupaComum.png" alt="logo" class="item-equipado-imagem item-equipado-disable" />
                    <span>Nada</span>
                </div>`
    }
    //Acessório
    if(acessorio && acessorio.nome != undefined){
        html += `<div id="arma" class="item-equipado" onclick="desequiparAcessorio(); renderItensIventario(); audioCancel()">
                    <img src="img/icons/${acessorio.icone}.png" alt="logo" class="item-equipado-imagem" />
                    <span>${acessorio.nome}</span>
                </div>`
                atkAdd += acessorio.atk;
                defAdd += acessorio.def;
    }else{
        html += `<div id="acessorio" class="item-equipado">
                    <img src="img/icons/bota.png" alt="logo" class="item-equipado-imagem item-equipado-disable" />
                    <span>Nada</span>
                </div>`
    }
    document.getElementById('itensEquipados').innerHTML = html
    setAtributes()
}

function renderStar(numer, classe = ''){
    let numeroEstrelas = Math.floor(numer / 2)
    let numeroMeiaEstelas = (numer / 2) - numeroEstrelas
    let numeroEstrelasFalando = 5 - numeroEstrelas - (numeroMeiaEstelas != 0 ? 1 : 0)
    //console.log('numero', numeroMeiaEstelas)
    let stars = ''
    for(let i = 0; i < numeroEstrelas; i++){
        stars += `<img src="img/star.svg" alt="logo" class="star-avali${classe}" onclick="visualizarFiltros(true)"/>`
    }
    if(numeroMeiaEstelas != 0){
        stars += `<img src="img/star-half.svg" alt="logo" class="star-avali${classe}" onclick="visualizarFiltros(true)"/>`
    }
    for(let i = 0; i < numeroEstrelasFalando; i++){
        stars += `<img src="img/star-none.svg" alt="logo" class="star-avali${classe}" onclick="visualizarFiltros(true)"/>`
    }
    return stars
}

//Modal avatar
function openModalSelectPerfil(){
    document.getElementById('modalSelectPerfil').className = 'modal d-flex'
    renderFaces()
}

function fecharModalSelectPerfil(){
    document.getElementById('modalSelectPerfil').className = 'modal d-none'
}

function renderFaces(){
    let content = document.getElementById('modalSelectPerfilContent')
    let html = ''
    for(let i = 1; i < 127; i++){
        html += `<img src="img/face/${i}.png" alt="face" class="${i == usuario.avatar ? 'faceSelecionada' : 'faceAselecionar'}" onclick="selectFace(${i})"/>`
    }
    content.innerHTML = html
}

function selectFace(id){
    usuario.avatar = id; 
    avatar = id
    document.getElementById('perfilAvatar').innerHTML = `<img  src="img/face/${id}.png" alt="face" />`
    fecharModalSelectPerfil()
}



//Itens
//Poções de cura porcentagem
function itemDeCuraPorcen(id) {
    let itemUsar = itensInventorio.find(x => x.id == id)
    if(itemUsar == undefined){
        audioError()
        return;
    }
    document.getElementById('descricaoItem').innerHTML = ''
    audioPot()
    let hpAumentar = Math.floor(usuario.hpMax * (itemUsar.hp / 100))
    let mpAumentar = Math.floor(usuario.mpMax * (itemUsar.mp / 100))

    usuario.hp += hpAumentar;
    usuario.mp += mpAumentar;
    if(usuario.hp > usuario.hpMax) usuario.hp = usuario.hpMax
    if(usuario.mp > usuario.mpMax) usuario.mp = usuario.mpMax
    for(let i = 0; i < usuario.itens.length; i++){
        if(usuario.itens[i].id == itemUsar.id){
            usuario.itens[i].qtd -= 1
            if(usuario.itens[i].qtd == 0){
                usuario.itens.splice(i,1)
            }
        }
    }
    salvarUsuarioBanco(usuario)
    recarregarItensInventario()
    renderItensIventario()
    setAtributes()
}

//Poções de aumento de atributo
function itemDeAtributoPorcen(id) {
    let itemUsar = itensInventorio.find(x => x.id == id)
    if(itemUsar == undefined){
        audioError()
        return;
    }
    document.getElementById('descricaoItem').innerHTML = ''
    audioPot()

    let hpAumentar = itemUsar.hpMax
    let mpAumentar = itemUsar.mpMax
    let atkAumentar = itemUsar.atk
    let defAumentar = itemUsar.def

    usuario.hp += hpAumentar;
    usuario.mp += mpAumentar;
    usuario.hpMax += hpAumentar
    usuario.mpMax += mpAumentar
    usuario.atk += atkAumentar
    usuario.def += defAumentar
    if(usuario.hp > usuario.hpMax) usuario.hp = usuario.hpMax
    if(usuario.mp > usuario.mpMax) usuario.mp = usuario.mpMax
    for(let i = 0; i < usuario.itens.length; i++){
        if(usuario.itens[i].id == itemUsar.id){
            usuario.itens[i].qtd -= 1
            if(usuario.itens[i].qtd == 0){
                usuario.itens.splice(i,1)
            }
        }
    }
    salvarUsuarioBanco(usuario)

    recarregarItensInventario()
    renderItensIventario()
    setAtributes()
}

function recarregarItensInventario(){
    itensInventorio = []
    for(let i = 0; i < usuario.itens.length; i++){
        let it = itensAll.find(x => x.id == usuario.itens[i].id)
        if(it != undefined){
            it.qtd = usuario.itens[i].qtd
            it.equipado = usuario.itens[i].equipado
            itensInventorio.push(it)
        }
    }
}