var highscores = [["Daan", 499], ["Bauke", 999999], ["Sjoerd", 500], ["Sybren", -25]];

newHighscore("Bauke", 1000000);

document.write('<table align="center">');
document.write('<tr><th>#</th><th>Naam</th><th>Score</th></tr>');
for (var i in highscores) {
    var place = parseInt(i) + 1;
    document.write('<tr>');
    document.write('<td>' + place + '</td>');
    for (var j in highscores[i]) {
        document.write('<td>' + highscores[i][j] + '</td>');
    }
    document.write('</tr>');
}
document.write('</table>');

function newHighscore(name, score) {
    highscores.push([name, score]);
    highscores.sort(sortHighscores);
}

function sortHighscores(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (b[1] < a[1]) ? -1 : 1;
    }
}