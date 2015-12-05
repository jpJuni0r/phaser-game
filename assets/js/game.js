var game = new Phaser.Game(640, 480, Phaser.AUTO, 'phaser-game', null, false, false);

var PhaserGame = function() {

}

PhaserGame.prototype = {
  preload: function() {
    this.load.image('background', 'assets/img/background-full.png');
    this.load.image('pipe', 'assets/img/pipe.png');
  },
  create: function() {
    game.add.image(0, 0, 'background');


    // Adding Pipes
    var leftPipeSprite = game.add.sprite(8, 352 + 32, 'pipe');
    leftPipeSprite.scale.setTo(2, 2);

    var rightPipeSprite = game.add.sprite(568, 352 + 32, 'pipe');
    rightPipeSprite.scale.setTo(2, 2);
  }
}

game.state.add('Game', PhaserGame, true)
