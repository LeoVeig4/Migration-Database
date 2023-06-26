const csv = require('csvtojson')
var fs = require('fs');

async function configureMovies(jsonObj) {
    let movies_data = []
    let last_id_movies = 0
    let genresMovies_data = []
    let genres_data = []
    let last_id_genre = 0
    for (let i = 0; i < jsonObj.length; i++) {

        const collection = jsonObj[i].belongs_to_collection ? JSON.parse(jsonObj[i].belongs_to_collection.replaceAll(`\\`, ` `)
            .replaceAll(`"`, `'`)
            .replaceAll(`{'`, '{"')
            .replaceAll(`':`, '":')
            .replaceAll(`',`, '",')
            .replaceAll(`: '`, ': "')
            .replaceAll(`, '`, ', "')
            .replaceAll(' None', ' "  "')
            .replaceAll(`'}`, '"}')) : ""
        if (collection !== "") console.log(collection)
        movies_data.push({
            idFilme: last_id_movies++,
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
    return { movies_data, genresMovies_data, genres_data }


}

async function configureCredit(creditCSV) {
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

            if (creditCSV[i].cast[j] === `"`) {
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

        credit_data.push({ "id": creditCSV[i].id, "cast": castArray, "crew": crewArray })
    }
    return credit_data
}
// Async / await usage
async function getJson() {
    const moviesCSV = await csv().fromFile('arquivo-input/movies_metadata.csv');
    const { genre_data, genresMovies_data, movies_data } = await configureMovies(moviesCSV)
    const creditCSV = await csv().fromFile('arquivo-input/credits.csv');
    const credit_data = await configureCredit(creditCSV)

}
getJson()