let pocoes = []
let equips = []
let objs = []
let usuario = {}

//armas e equipamentos
let arma = {}
let roupa = {}
let escudo = {}
let acessorio = {}
let chapeu = {}

function abrirLoja(){
    buscarBase()
    document.getElementById('estrelasComentJose').innerHTML = renderStar(10, '-mini')

    includeHTML()
}

function buscarBase(){
    usuario = JSON.parse(localStorage.aventureiro);
    fetch(
        'get_json.php'
    )
    .then((res) => {
        return res.json();
    })
    .then((db) => {
        db = db.db
        pocoes = db.pocoes.filter(x => (x.nivel == undefined || x.nivel <= usuario.nivel) &&
                                        (x.classe == undefined || x.classe == usuario.classe));
        equips = db.equipamentos.filter(x => (x.nivel == undefined || x.nivel <= usuario.nivel) &&
                                        (x.classe == undefined || x.classe == usuario.classe));
        objs = db.objetos.filter(x => (x.nivel == undefined || x.nivel <= usuario.nivel) &&
                                       x.classe == undefined || x.classe == usuario.classe);
        usuario =  db.usuarios.find(x => x.id == usuario.id)
        usuario.senha = undefined
        audioConfirm()
        document.getElementById('quantidadeEquips').innerHTML = equips.filter(x => x.naoVendeNaLoja != true &&
                                                    usuario.itens.find(y => y.id == x.id) == undefined).length;
        document.getElementById('quantidadeObj').innerHTML = objs.filter(x => x.naoVendeNaLoja != true).length;
        document.getElementById('quantidadePot').innerHTML = pocoes.filter(x => x.naoVendeNaLoja != true).length;
        document.getElementById('quantidadeCoinsUser').innerHTML = usuario.bravecoins;
        buscarPocoes()
        buscarInventario()
        getItensIventario()
    })
    .catch((err) => {
        console.error(err);
    });
}

function buscarPocoes(){
    let htmlCode = ''
    for(let i = 0; i < pocoes.length; i++){
        htmlCode += templateItem(pocoes[i])
    }
    audioConfirm()
    document.getElementById('titleTypeItem').innerHTML = 'Poções'
    document.getElementById('lojaItens').innerHTML = htmlCode
}

function buscarEquipamentos(){
    let htmlCode = ''
    for(let i = 0; i < equips.length; i++){
        htmlCode += templateItem(equips[i])
    }
    audioConfirm()
    document.getElementById('titleTypeItem').innerHTML = 'Equipamentos'
    document.getElementById('lojaItens').innerHTML = htmlCode
}

function buscarObjetos(){
    let htmlCode = ''
    for(let i = 0; i < objs.length; i++){
        htmlCode += templateItem(objs[i])
    }
    audioConfirm()
    document.getElementById('titleTypeItem').innerHTML = 'Objetos'
    document.getElementById('lojaItens').innerHTML = htmlCode
}

function buscarInventario(){
    let itensAll = getItensTotal()
    let itens = []
    for(let i = 0; i < usuario.itens.length; i++){
        let it = itensAll.find(x => (x.id == usuario.itens[i].id && x.tipo != 2))  
        if(it != undefined){
            it.qtd = usuario.itens[i].qtd
            itens.push(it)
        }
    }
    let htmlCode = ''
    for(let i = 0; i < itens.length; i++){
        htmlCode += templateItemInventario(itens[i])
    }
    audioConfirm()
    document.getElementById('titleTypeItem').innerHTML = 'Objetos'
    document.getElementById('inventarioUsuario').innerHTML = htmlCode
}

function abrirProduto(id){
    audioConfirm()
    let item = getItensTotal().find(x => x.id == id)
    document.getElementById('descricaoItem').innerHTML = templateDescricao(item)
    visualizarFiltros(false)
}

function abrirProdutoVender(id){
    audioConfirm()
    let item = getItensTotal().find(x => x.id == id)
    document.getElementById('descricaoItem').innerHTML = templateDescricaoVender(item)
    visualizarFiltros(false)
}

function getItensTotal(){
    let itens = pocoes
    itens = itens.concat(equips, objs)
    return itens
}

function filtrar(){
    let nome = document.getElementById('filtroNome').value;
    let raridade = document.getElementById('filtroRaridade').value;
    let tipo = document.getElementById('filtroTipo').value;
    let itens = getItensTotal().filter(x => {
        return (x.nome.indexOf(nome) >= 0) &&
               (raridade == 0 || x.raridade == raridade) &&
               (tipo == 0 || x.tipo == tipo)
    })

    if(itens.length <= 0){
        document.getElementById('titleTypeItem').innerHTML = 'Opss!'
        document.getElementById('lojaItens').innerHTML = '<div class="text-center m-5">Nenhum resultado encontrado</div>'
        audioError()
        return;
    }

    let htmlCode = ''
    for(let i = 0; i < itens.length; i++){
        htmlCode += templateItem(itens[i])
    }
    audioConfirm()
    document.getElementById('titleTypeItem').innerHTML = 'Loja'
    document.getElementById('lojaItens').innerHTML = htmlCode
}

function comprar(id){
    let itemNovo = getItensTotal().find(x => x.id == id)
    if(itemNovo == undefined){
        audioError()
        return;
    }
    if(usuario.bravecoins < itemNovo.preco){
        audioError()
        return
    }
    audioComprar()
    if(usuario.itens.find(x => x.id == itemNovo.id) == undefined){
        usuario.itens.push({
            id: itemNovo.id,
            qtd: 1
        })
    }else{
        for(let k = 0; k < usuario.itens.length; k++){
            if(usuario.itens[k].id == itemNovo.id) usuario.itens[k].qtd += 1
        }
    }
    usuario.bravecoins -= itemNovo.preco
    salvarUsuarioBanco(usuario)
    visualizarFiltros(true)
    document.getElementById('quantidadeCoinsUser').innerHTML = usuario.bravecoins;
    buscarInventario()
    if(itemNovo.tipo == 1) buscarPocoes()
    if(itemNovo.tipo == 2) buscarEquipamentos()
    if(itemNovo.tipo == 3) buscarObjetos()
}

function vender(id){
    let itemNovo = getItensTotal().find(x => x.id == id)
    if(itemNovo == undefined){
        audioError()
        return;
    }
    if(usuario.bravecoins < itemNovo.preco){
        audioError()
        return
    }
    audioComprar()
    for(let k = 0; k < usuario.itens.length; k++){
        if(usuario.itens[k].id == itemNovo.id){
            usuario.itens[k].qtd -= 1
            if(usuario.itens[k].qtd <= 0){
                usuario.itens.splice(k, 1)
            }
        }
    }
    usuario.bravecoins += Math.floor(itemNovo.preco * 0.1)
    salvarUsuarioBanco(usuario)
    visualizarFiltros(true)
    document.getElementById('quantidadeCoinsUser').innerHTML = usuario.bravecoins;
    buscarInventario()
}

function visualizarFiltros(ver){
    document.getElementById('containerFiltros').className = `lmd-container ${ver ? 'd-block' : 'd-none'}`
    document.getElementById('descricaoItem').className = `lmd-container ${ver ? 'd-none' : 'd-block'}`
}

function templateItemInventario(item){
    return `<div class="loja-item" onmouseover="audioCursor()" onclick="abrirProdutoVender(${item.id})">
        <img src="img/icons/${item.icone}.png" alt="logo" />
        <span>${item.nome}  x${item.qtd}</span>
        <div class="item-preco">
            <img src="img/icons/moeda.png" alt="logo" /> ${Math.floor(item.preco / 10)}
        </div>
    </div>`
}

function templateItem(item){
    if(item.naoVendeNaLoja == true) return '';
    if(item.tipo == 2 && usuario.itens.find(x => x.id == item.id) != undefined) return '';

    return `<div class="loja-item" onmouseover="audioCursor()" onclick="abrirProduto(${item.id})">
        <img src="img/icons/${item.icone}.png" alt="logo" />
        <span>${item.nome}</span>
        <div class="item-preco ${usuario.bravecoins < item.preco ? 'colorRed' : ''}">
            <img src="img/icons/moeda.png" alt="logo" /> ${item.preco}
        </div>
    </div>`
}

function templateDescricao(item){
    return `<div class="lmd-header">
                <img src="img/find.svg" alt="logo" class="find-icon"  onclick="visualizarFiltros(true)"/>
                ${item.nome}
            </div>
            <div class="loja-descricao-body">
                <img src="img/itens/${item.icone}.png" alt="logo" class="descricao-item-image" />
                <div class="estrelas-container">${renderStar(item.avaliacao)}</div>
                <span>${item.descricao}</span>
                <hr />
                ${item.classe != undefined ? `<span>Classe: <b class="${item.classe != usuario.classe ? 'colorRed' : ''}">${item.classe}</b></span>` : ''}
                ${item.nivel != undefined && item.tipo == 2 ? `<span><i class="${item.nivel > usuario.nivel ? 'colorRed' : ''}">Nv.${item.nivel}</i></span>` : ''}
                <i>${item.efeito}</i>
                ${item.tipo == 2 ? '<hr />' : ''}
                ${renderMelhoriaAtributos(item.id)}
                <button class="button-condado button-comprar" onclick="comprar(${item.id})">
                    Comprar: ${item.preco} BraveCoins
                </button>
            </div>`
}

function templateDescricaoVender(item){
    return `<div class="lmd-header">
                <img src="img/find.svg" alt="logo" class="find-icon"  onclick="visualizarFiltros(true)"/>
                ${item.nome}
            </div>
            <div class="loja-descricao-body">
                <img src="img/itens/${item.icone}.png" alt="logo" class="descricao-item-image" />
                <div class="estrelas-container">${renderStar(item.avaliacao)}</div>
                <span>${item.descricao}</span>
                <hr />
                ${item.classe != undefined ? `<span>Classe: <b class="${item.classe != usuario.classe ? 'colorRed' : ''}">${item.classe}</b></span>` : ''}
                <i>${item.efeito}</i>
                <button class="button-condado button-comprar" onclick="vender(${item.id})">
                    Vender: ${Math.floor(item.preco * 0.1)} BraveCoins
                </button>
            </div>`
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

function getItensIventario(){
    let itensInventorio = usuario.itens
    for(let i = 0; i < itensInventorio.length; i++){
        if(itensInventorio[i].equipado == true){
            let itemEmQuestao = equips.find(x => x.id == itensInventorio[i].id)
            switch (itemEmQuestao.subtipo){
                case 'arma':
                    arma = itemEmQuestao
                    break;
                case 'escudo':
                    escudo = itemEmQuestao
                    break;
                case 'roupa':
                    roupa = itemEmQuestao
                    break;
                case 'chapeu':
                    chapeu = itemEmQuestao
                    break;
                default:
                    acessorio = itemEmQuestao
            }
        }
    }
}

function renderMelhoriaAtributos(id){
    let itemEmQuestao = equips.find(x => x.id == id);
    if(itemEmQuestao != undefined && itemEmQuestao.tipo == 2){
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