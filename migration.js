const csv = require('csvtojson')
var fs = require('fs');

async function configureMovies(jsonObj) {
    let movies_data = []
    let last_id_movies = 0
    let genresMovies_data = []
    let genres_data = []
    let last_id_genre = 0
    for (let i = 0; i < jsonObj.length; i++) {

        const boolean = (jsonObj[i].release_date > '2000-00-00' && Number(jsonObj[i].vote_average) >= 7)
        if (boolean) {
            const collection = jsonObj[i].belongs_to_collection ? JSON.parse(jsonObj[i].belongs_to_collection.replaceAll(`\\`, ` `)
                .replaceAll(`"`, `'`)
                .replaceAll(`{'`, '{"')
                .replaceAll(`':`, '":')
                .replaceAll(`',`, '",')
                .replaceAll(`: '`, ': "')
                .replaceAll(`, '`, ', "')
                .replaceAll(' None', ' "  "')
                .replaceAll(`'}`, '"}')) : ""
            //if (collection !== "") console.log(collection)
            movies_data.push({
                idFilme: last_id_movies++,
                iddataset: jsonObj[i].id,
                collection_id: collection?.id,
                nome_da_colecao: collection?.name,
                titulo: jsonObj[i].title,
                ano: jsonObj[i].release_date,
                custo: jsonObj[i].budget,
                original_language: jsonObj[i].original_language,
                resumo: jsonObj[i].overview,
                popularidade: jsonObj[i].popularity,
                dataDeLancamento: jsonObj[i].release_date,
                receitaEmDolar: jsonObj[i].revenue,
                duracao: jsonObj[i].runtime,
                mediaDeVotos: jsonObj[i].vote_average,
                totalDeVotos: jsonObj[i].vote_count,
            })
            const genres = JSON.parse(jsonObj[i].genres.replaceAll(`'`, `"`))
            for (const genre of genres) {
                const genreFind = genres_data.find(element => element.name === genre.name)
                if (!genreFind) {
                    genres_data.push({
                        idGenero: last_id_genre++,
                        name: genre.name
                    })
                    genresMovies_data.push({
                        idFilme: movies_data.length - 1,
                        idGenero: Number(last_id_genre - 1)
                    })
                } else {
                    genresMovies_data.push({
                        idFilme: movies_data.length - 1,
                        idGenero: Number(genreFind.idGenero)
                    })
                }
            }
        }
    }
    return { movies_data, genresMovies_data, genres_data }


}

async function configureCredit(creditCSV, movies_data) {
    let credit_data = []
    for (let i = 0; i < creditCSV.length; i++) {
        let cast = creditCSV[i].cast
            .replaceAll(`\\`, ` `)
            .replaceAll(`"`, `'`)
            .replaceAll(`{'`, '{"')
            .replaceAll(`':`, '":')
            .replaceAll(`',`, '",')
            .replaceAll(`: '`, ': "')
            .replaceAll(`, '`, ', "')
            .replaceAll(`'}`, '"}')
            .replaceAll(' None}', ' "  "}')
        let crew = creditCSV[i].crew
            .replaceAll(`"`, `'`)
            .replaceAll(`{'`, '{"')
            .replaceAll(`':`, '":')
            .replaceAll(`',`, '",')
            .replaceAll(`: '`, ': "')
            .replaceAll(`, '`, ', "')
            .replaceAll(`'}`, '"}')
            .replaceAll(' None}', ' "  "}')
        let points = { begin: 0, end: 0 }
        let crewArray = []
        let castArray = []
        numberQuotes = 0;
        for (let j = 0; j < creditCSV[i].crew.length; j++) {

            if (creditCSV[i].crew[j] === '{') {
                points.begin = j
            } else if (creditCSV[i].crew[j] === '}') {
                //console.log(creditCSV[i].crew[j + 1])
                points.end = j + 1
                let string = crew.slice(points.begin, points.end)



                crewArray.push(JSON.parse(string))
            }
        }
        points = { begin: 0, end: 0 }
        for (let j = 0; j < creditCSV[i].cast.length; j++) {

            if (cast[j] === `"`) {
                numberQuotes++
            }
            if (creditCSV[i].cast[j] === '{') {
                points.begin = j
            } else if (creditCSV[i].cast[j] === '}') {
                //console.log(creditCSV[i].crew[j + 1])
                points.end = j + 1
                let string = cast.slice(points.begin, points.end)
                if (numberQuotes === 24)
                    castArray.push(JSON.parse(string))
                numberQuotes = 0
            }
        }
        const findmovie = movies_data.find(element => element.iddataset === creditCSV[i].id)
        if (findmovie)
            credit_data.push({ "iddataset": creditCSV[i].id, "cast": castArray, "crew": crewArray, idFilme: findmovie.idFilme })
    }
    return credit_data
}

async function configureCrew(credit_data) {
    let crew = []
    let func_crew = []
    let last_id_func_crew = 0
    for (let i = 0; i < credit_data.length; i++) {
        for (let j = 0; j < credit_data[i].crew.length; j++) {
            const findcrew = crew.find(element => element.name === credit_data[i].crew[j].name)
            if (findcrew) {
                func_crew.push({
                    idCrew: findcrew.idCrew,
                    idFilme: credit_data[i].idFilme,
                    func: credit_data[i].crew[j].job
                })
            } else {
                crew.push({
                    idCrew: last_id_func_crew++,
                    name: credit_data[i].crew[j].name,
                    gender: credit_data[i].crew[j].gender
                })
                func_crew.push({
                    idCrew: last_id_func_crew - 1,
                    idFilme: credit_data[i].idFilme,
                    func: credit_data[i].crew[j].job
                })

            }
        }
    }
    return { crew: crew, func_crew: func_crew }
}

async function configureAtor(credit_data) {
    let ator = []
    let elenco = []
    let last_id_ator = 0
    for (let i = 0; i < credit_data.length; i++) {
        for (let j = 0; j < credit_data[i].cast.length; j++) {
            const findator = ator.find(element => element.name === credit_data[i].cast[j].name)
            if (findator) {
                elenco.push({
                    idAtor: findator.idAtor,
                    idFilme: credit_data[i].idFilme,
                    played: credit_data[i].cast[j].character
                })
            } else {
                ator.push({
                    idAtor: last_id_ator++,
                    name: credit_data[i].cast[j].name,
                    gender: credit_data[i].cast[j].gender
                })
                elenco.push({
                    idAtor: last_id_ator - 1,
                    idFilme: credit_data[i].idFilme,
                    played: credit_data[i].cast[j].character
                })
            }
        }
    }
    return { ator: ator, elenco: elenco }
}

async function CreateAtorMigration(ator) {
    let string = ""
    for (let i = 0; i < ator.length; i++) {
        string += `insert into ator values (${ator[i].idAtor}, "${ator[i].name}", "${ator[i].gender}")\n`
    }
    fs.writeFile('ator.txt', string, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('File has been written successfully.');
    });

}
async function CreateCrewMigration(crew) {
    let string = ""
    for (let i = 0; i < crew.length; i++) {
        string += `inset into equipe values (${crew[i].idCrew}, "${crew[i].name}", ${crew[i].gender})\n`
    }
    fs.writeFile('equipe.txt', string, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('File has been written successfully.');
    });
}

async function CreateFilmeMigration(movies_data) {
    let string = ""
    for (let i = 0; i < movies_data.length; i++) {
        string += `ìnsert into filme values (${movies_data[i].idFilme}, "${movies_data[i].titulo}", ${movies_data[i].custo}, "${movies_data[i].original_language}", "${movies_data[i].resumo}", ${movies_data[i].popularidade}, "${movies_data[i].dataDeLancamento}", ${movies_data[i].receitaEmDolar}, ${movies_data[i].duracao}, ${movies_data[i].mediaDeVotos}, ${movies_data[i].totalDeVotos}, "${movies_data[i].nome_da_colecao}")\n`
    }
    fs.writeFile('filme.txt', string, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('File has been written successfully.');
    });
}

async function CreateGeneroMigration(genres_data) {
    let string = ""
    for (let i = 0; i < genres_data.length; i++) {
        string += `insert into genero values (${genres_data[i].idGenero}, "${genres_data[i].name}")\n`
    }
    fs.writeFile('categoria.txt', string, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('File has been written successfully.');
    });
}

async function CreateCategoriaFilmeMigration(genresMovies_data) {
    let string = ""
    for (let i = 0; i < genresMovies_data.length; i++) {
        string += `insert into categoria_filme values (${genresMovies_data[i].idFilme}, ${genresMovies_data[i].idGenero})\n`
    }
    fs.writeFile('categoria_filme.txt', string, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('File has been written successfully.');
    });
}

async function CreateFuncaoEquipeMigration(func_crew) {
    let string = ""
    for (let i = 0; i < func_crew.length; i++) {
        string += `insert into funcao_equipe values (${func_crew[i].idCrew}, ${func_crew[i].idFilme}, "${func_crew[i].func}")\n`
    }
    fs.writeFile('funcao_equipe.txt', string, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('File has been written successfully.');
    });
}

async function CreateElencoMigration(elenco) {
    let string = ""
    for (let i = 0; i < elenco.length; i++) {
        string += `insert into elenco values (${elenco[i].idFilme}, ${elenco[i].idAtor}, "${elenco[i].played}")\n`
    }
    fs.writeFile('elenco.txt', string, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('File has been written successfully.');
    });
}
// Async / await usage
async function getJson() {
    const moviesCSV = await csv().fromFile('arquivo-input/movies_metadata.csv');
    const { genres_data, genresMovies_data, movies_data } = await configureMovies(moviesCSV)
    const creditCSV = await csv().fromFile('arquivo-input/credits.csv');
    const credit_data = await configureCredit(creditCSV, movies_data)
    const { crew, func_crew } = await configureCrew(credit_data)
    const { ator, elenco } = await configureAtor(credit_data)
    await CreateAtorMigration(ator)
    await CreateCrewMigration(crew)
    await CreateFilmeMigration(movies_data)
    await CreateGeneroMigration(genres_data)

    await CreateCategoriaFilmeMigration(genresMovies_data)
    await CreateFuncaoEquipeMigration(func_crew)
    await CreateElencoMigration(elenco)
    // crew = equipe
    //func_crew = funcao_equipe
    //genresMovies_data == categoria_filme
    //genre_data ==categorias
    //movies_data == filme
}
getJson()