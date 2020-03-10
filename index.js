const got = require('got');
const cheerio = require('cheerio');
const fs = require('fs')

const extraiValorMoeda = (valor) => {
    if(valor !== undefined){
        return parseInt(valor.replace(/(.+R\$ )|\./g,"").trim());
    }
    return 0;

};

function getNumeroPaginas() {
    const numeroPagina = parseInt($(".module_pagination").find(".last").find("a").attr("href").replace(/(.+&o=)|(&pe=.+)/g, "").trim())
    if(numeroPagina !== undefined){
        return numeroPagina;
    }
    return 1;
}

function getBairro(anuncio) {
    const bairro = anuncio.find(".detail-region").text().trim().split(",")[1];
    if(bairro !== undefined){
        return bairro.trim();
    }
    return "";
}

function getDetalhesAnuncio(anuncio) {
    return anuncio.find(".detail-specific").text().trim().split("|");
}

(async () => {
    let linha;
    try {

        fs.writeFile("lista.csv", "link,bairro,aluguel,condominio,total\n", function (err, data) {
            if (err) {
                return console.log("ERRO"+err);
            }
        });

        const linkInicialBusca = 'https://pr.olx.com.br/regiao-de-curitiba-e-paranagua/imoveis/aluguel/apartamentos?gsp=1&pe=1200';

        const bairros = [
            'Água Verde',
            'Alto da Glória',
            'Alto da XV',
            'Batel',
            'Cabral',
            'Centro',
            'Centro Cívico',
            'Cristo Rei',
            'Guaíra',
            'Hauer',
            'Hugo Lange',
            'Lindóia',
            'Jardim Botânico',
            'Jardim Social',
            'Portão',
            'Prado Velho',
            'Rebouças',
            'São Francisco'
        ];

        let response = await got(linkInicialBusca);
        $ = cheerio.load(response.body);

        const numeroPaginas = getNumeroPaginas();

        for (let pagina = 1; pagina <= numeroPaginas; pagina++) {
            response = await got(linkInicialBusca + "&o=" + pagina, {encoding: "latin1"});
            console.log(linkInicialBusca + "&o=" + pagina);
            $ = cheerio.load(response.body);

            let anuncios = $("#main-ad-list").children("li");

            for (var i = 0; i < anuncios.length; i++) {
                let anuncio = anuncios.eq(i);


                let link = anuncio.find("a").attr("href");

                if (link === undefined) {
                    continue;
                }

                let detalhesAnuncio = getDetalhesAnuncio(anuncio);
                let bairro = getBairro(anuncio);
                if (!bairros.includes(bairro)) {
                    continue;
                }

                let valorCondominio = extraiValorMoeda(detalhesAnuncio[2]);
                let valorAluguel = extraiValorMoeda(anuncio.find(".OLXad-list-price").text());
                let valorTotal = valorCondominio + valorAluguel;

                if (valorAluguel + valorCondominio <= 1200) {
                    linha = link + "," + bairro + "," + valorAluguel + "," + valorCondominio + "," + valorTotal + "\n"
                    console.log(linha);
                    fs.appendFile("lista.csv", linha, function (err, data) {
                        if (err) {
                            return console.log("wololo"+err);
                        }
                    });

                }
            }
        }

    } catch (error) {
        console.log(error);
        //=> 'Internal server error ...'
    }
})();
