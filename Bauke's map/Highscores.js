var highscores = [["Daan", 499], ["Bauke", 999999], ["Sjoerd", 500], ["Sybren", -25]];

var naam = "Jos";
var score = 0;

highscores.push([naam, score]);

highscores.sort(sortHighscores);

document.write('<table>');
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

function sortHighscores(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (b[1] < a[1]) ? -1 : 1;
    }
}