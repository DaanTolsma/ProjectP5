var highscores = [["Daan", 499], ["Bauke", 40], ["Sjoerd", 500]];
// var smallest = 40;
// var secondsmallest = 499;
// var biggest = 500;


var limit = 3;
var name = "";
var score = 9999;

if (score != null) {
    while (name == "") {
    getName();
}

newHighscore(name, score);
}

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
    if (place == limit) {
        break;
    }
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

function getName() {
    name = prompt("Please enter your name", "Name");
}

/*
if(newHighscore(score) < smallest){
break;
}
else if(newHighscore(score) < secondsmallest){
highscores.pop();
smallest = newHighscore();
}
else if(newHighscore(score) < biggest){
highscores.pop();
smallest = secondsmallest;
secondsmallest = newHighscore();
}
else{
highscores.pop();
biggest = newHighscore();
} */ 