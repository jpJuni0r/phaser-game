var game = new Phaser.Game(640, 480, Phaser.AUTO, 'phaser-game', null, false, false);

var PhaserGame = function() {

}

PhaserGame.prototype = {
  preload: function() {
    this.load.image('background', 'assets/img/background-full.png');
  },
  create: function() {
    game.add.image(0, 0, 'background');
  }
}

game.state.add('Game', PhaserGame, true)
