var game = new Phaser.Game(640, 480, Phaser.AUTO, 'phaser-game', null, false, false);

var PhaserGame = function() {

};

var ground = [];
var player;
var enemies = [];
var leftPipeSprite, rightPipeSprite;
var score = 0,
  scoreObject;

PhaserGame.prototype = {
  preload: function() {
    this.load.image('background', 'assets/img/background-full.png');
    this.load.image('pipe', 'assets/img/pipe.png');
    this.load.image('ground', 'assets/img/ground.png');
    this.load.spritesheet('enemie', 'assets/img/enemie.png', 16, 26, 3, 0);
    this.load.spritesheet('player', 'assets/img/player.png', 17, 28, 5, 0);
  },
  create: function() {
    game.add.image(0, 0, 'background');
    var fontStyle = {
      font: '16px Emulogic',
      fill: '#fff',
    };

    scoreObject = game.add.text(8, 8, score + ' Points', fontStyle);
    scoreObject.setShadow(2, 4, '#000', 6, 8);


    // Physics
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 100;


    // Adding Pipes
    leftPipeSprite = game.add.sprite(8, 352 + 32, 'pipe');
    leftPipeSprite.scale.setTo(2, 2);
    game.physics.enable(leftPipeSprite, Phaser.Physics.ARCADE);
    leftPipeSprite.body.immovable = true;
    leftPipeSprite.body.allowGravity = false;

    rightPipeSprite = game.add.sprite(568, 352 + 32, 'pipe');
    rightPipeSprite.scale.setTo(2, 2);
    game.physics.arcade.enableBody(rightPipeSprite);
    rightPipeSprite.body.immovable = true;
    rightPipeSprite.body.allowGravity = false;


    // Ground
    for (var i = 0; i < 20; i++) {
      ground.push(game.add.sprite(32 * i, 448, 'ground'));
      ground[i].scale.setTo(2, 2);

      game.physics.enable(ground[i], Phaser.Physics.ARCADE);
      ground[i].body.immovable = true;
      ground[i].body.allowGravity = false;
    }


    // Initialize enemy spawning
    if (enemies.length == 0) {
      spawnEnemie();
    }



    // Player
    player = game.add.sprite(game.world.centerX, 50, 'player');
    player.scale.setTo(2, 2);
    player.anchor.setTo(0.5, 0.5);

    player.animations.add('left', [0, 1], 15, true);
    player.animations.add('right', [0, 1], 15, true);
    player.animations.add('jump', [2], 1, true);
    player.animations.add('fall', [3], 1, true);
    player.animations.add('dead', [4], 1, true);

    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;
    player.body.gravity.y = 1000;
    player.body.maxVelocity.y = 500;

    // Player status: 0 alive, 1 dead
    player.status = 0;
  },
  update: function() {
    // Update score
    scoreObject.setText(score + (score == 1 ? ' Point' : ' Points'));


    // Collisions
    if (player.status == 0) {
      ground.forEach(function(tile) {
        game.physics.arcade.collide(player, tile);
      });
    } else {
      player.body.collideWorldBounds = false;
    }

    game.physics.arcade.collide(player, leftPipeSprite);
    game.physics.arcade.collide(player, rightPipeSprite);


    // Enemie logic
    enemies.forEach(function(enemie) {
			if (enemie.status <= 3) {
				game.physics.arcade.collide(enemie, ground);

				// Pipe Collisions
				[leftPipeSprite, rightPipeSprite].forEach(function(pipe) {
					// Event handler
					game.physics.arcade.collide(enemie, pipe, function() {
						if (enemie.facing == 'left') {
							enemie.facing = 'right';
							enemie.body.velocity.x = 40;
							enemie.animations.play('right');
            	enemie.scale.x = -2;
						} else {
							enemie.facing = 'left';
							enemie.body.velocity.x = -40;
							enemie.animations.play('left');
            	enemie.scale.x = 2;
						}
					});
				});
			}

      switch (enemie.status) {
        // Spawn enemie
        case 0:
          var spawnLeftPipe = Math.floor(Math.random() * 2);
          var velocityFactor = Math.random() + 0.5;
          if (spawnLeftPipe) {
            enemie.position.x = 38;
            enemie.position.y = 390;
            enemie.body.velocity.x = 200 * velocityFactor;
          } else {
            enemie.position.x = 610;
            enemie.position.y = 390
            enemie.body.velocity.x = -200 * velocityFactor;
          }

          enemie.body.gravity.y = 1000;
          enemie.body.maxVelocity = 500;
          enemie.body.velocity.y = -750;

          enemie.status += 1;
          enemie.facing = 'left';
          break;
        case 1:
          // Is landed on the ground?
          if (enemie.body.position.y == 396) {
            enemie.body.velocity.x = 0;

            enemie.status += 1;

            window.setTimeout(function() {
              if (enemie.body.position.x > player.body.position.x) {
                enemie.body.velocity.x = -40;
                enemie.animations.play('left');
              } else {
                enemie.body.velocity.x = 40;
                enemie.animations.play('right');
                enemie.scale.x = -2;
              }

              enemie.status += 1;
            }, 1000);
          }
          break;
        case 3:
          // -- Idle mode

          break;
      }
    });


    // Player movement
    cursors = game.input.keyboard.createCursorKeys();
    player.body.velocity.x = 0;

    // Player enemie colision
    enemies.forEach(function(enemie, index) {
      // Is the enemie alive?
      if (enemie.status == 3 && player.status == 0) {
        game.physics.arcade.collide(enemie, player, function() {
          // Did the player land on top of the enemie?
					var distance = enemie.body.position.y - player.body.position.y;
          if (distance == 56) {
            // Dying animation
            enemie.status = 4;
            enemie.animations.play('dead');
            enemie.body.velocity.y = -200;
            enemie.body.velocity.x = 0;


            // Throw player in the air
            player.body.velocity.y = -550;

            // Increase score
            score += 1;


            window.setTimeout(function() {
              enemie.kill();
              //enemies.splice(index, 1);
            }, 1000);
          } else {
            player.status = 1;
            player.animations.play('dead');
            player.body.velocity.y = -400;
            setTimeout(function() {
              player.kill();
            }, 2000);
          }
        }, function() {
          // Kill the player when he is inside of an enemy
          if (player.body.position.y == 392) {
            player.status = 1;
            player.animations.play('dead');
            player.body.velocity.y = -400;
            setTimeout(function() {
              player.kill();
            }, 2000);
          }
        });
      }
    });

    // Is the player alive
    if (player.status == 0) {
      if (cursors.left.isDown) {
        //  Move to the left
        player.body.velocity.x = -250;
        player.animations.play('left');

        // Face left
        player.scale.x = -2;

        facing = 'left';
      } else if (cursors.right.isDown) {
        //  Move to the right
        player.body.velocity.x = 250;
        player.animations.play('right');

        // Face right
        player.scale.x = 2;

        facing = 'right';
      } else {
        //  Stand still
        player.frame = 0;
      }

      //  Allow the player to jump if they are touching the ground.
      if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -550;
      }

      // Flying animation
      // Is the player in the air
      if (!player.body.touching.down) {
        // Is the player falling
        player.animations.stop();
        if (player.body.velocity.y <= 1) {
          player.animations.play('jump');
        } else {
          player.animations.play('fall');
        }
      }
    }
  }
};

function spawnEnemie() {
  var enemie = enemie = game.add.sprite(game.world.centerX + 20, 40, 'enemie');
  enemie.scale.setTo(2, 2);
  enemie.anchor.setTo(0.5, 0.5);
  enemie.immovable = true;

  enemie.animations.add('left', [1, 2], 6, true);
  enemie.animations.add('right', [1, 2], 6, true);
  enemie.animations.add('air', [0]);
  enemie.animations.add('dead', [0]);

  /*
  0: Not drawn to screen
  1: Drawn to screen and launched
  2: Land on the ground
  3: Out of shell and walking around
  4: Dying
  */
  enemie.status = 0;

  game.physics.enable(enemie, Phaser.Physics.ARCADE);

  enemies.push(enemie);

  // Random timer
  var timer = Math.random() * 2 + 0.5;
  setTimeout(function() {
    spawnEnemie();
  }, timer * 1000);
}

game.state.add('Game', PhaserGame, true);
