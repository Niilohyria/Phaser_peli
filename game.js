   // part1.
   // config määrittelee pelipohjan, yms.
	var config = {
		// auto = antaa selaimen päättää, käyttääkö se WebGL vai Canva
        type: Phaser.AUTO,
		// pelialueen koko
		// EXTRA: pelaajaa seuraava kamera
		// nyt pelialue on suurempi kuin tämä
		// kameran ruudun koko
        width: 800,
        height: 600,
		// part 4.
        physics: {
            default: 'arcade',
            arcade: {
				// maanvetovoima, kuinka paljon lattia vetää hahmoja puoleensa
                gravity: { y: 300 },
				// debug --> true niin peliin piirretään suuntaviivoja ym.
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

// PELIN MUUTTUJAT
	// part 4.
	// käveltävät tasot, eli kerrosten lattiat
	var platforms;
	
	// part 5.
	// pelihahmokin tarvitsee muuttujan
    var player;
	
	// part 7.
	// pelin kontrollit
	var cursors;
	
	// part 8.
	// kerättävät objektit
	var stars;
	
	// part 9.
	// pistelaskuri, eli lukumäärä
	var score = 0;
	// näytöllä näkyvä tekstikohta
    var scoreText;
	
	// part 10. vihollinen
	var bombs;
	var gameOver = false;
	//äänimuuttujat
	// game on "peliolio", jossa kaikki tapahtuu
    var game = new Phaser.Game(config);
	
	// preload valmistaa että kaikki pelissä tarvittavat hahmot, tasot, musiikit, ym. on ladattu selaimeen ennen kuin peli saa startata.
    function preload ()
    {	
		// part 2.
		// - kaikki tiedot, jotka täytyy olla tallessa selaismessa ennen kuin peli saa käynnistyä.
        this.load.image('sky', 'assets/Skeri.jpg');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
		// oma extra:
		fx_star = this.load.audio('fx_star','assets/coin_get.wav');
		fx_hit = this.load.audio('fx_hit','assets/hit.wav');
		fx_jump = this.load.audio('fx_jump','assets/jump.ogg');
		fx_background = this.load.audio('fx_background','assets/spaceship.wav');
		fx_steps = this.load.audio('fx_steps','assets/snowWalk.ogg');
		
    } //preload päättyy
	
	// piirtää pelialueelle taustakuvat, hahmot, ym.
    function create ()
    {	// part 3.
		// kuvan keskipiste sijoitetaan paikkaan 400, 300
        this.add.image(400, 300, 'sky');
		
		// part 4. lattian tasot
        platforms = this.physics.add.staticGroup();
		
		// tason sijainti, x, y
		// alin
        platforms.create(400, 568, 'ground').setScale(2).refreshBody();
		
		// keskimmäisin
        platforms.create(600, 400, 'ground');
		
		// melkein korkein
        platforms.create(50, 250, 'ground');
       
	   // korkein
	   platforms.create(750, 220, 'ground');
		
		// part 5.
        player = this.physics.add.sprite(100, 450, 'dude');
		
		// pelaajan kimmoisuus
		// 0.2 --> pelaaja pomppaa 20% voimalla siitä, mitä laskeutuessa
        player.setBounce(0.2);
		// estääkö pelialueen rajat pelaajan läpi menemistä
        player.setCollideWorldBounds(true);
		
		// kun painetaan vasemmalle:
        this.anims.create({
            key: 'left',
			// aletaan toistaa spritesheet:sta kuvia 
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
			// kuinka monta kuvaa animaatio toistaa per sekunti
            frameRate: 10,
			// animaation "loop":
			// -1 = ikuinen looppi
            repeat: -1
        });

		// "idle", eli ei paineta kontrolleja
        this.anims.create({
            key: 'turn',
			// näytetän vain framea 4
            frames: [ { key: 'dude', frame: 4 } ],
			// still-kuvaa ei kannata päivittää kuin 1 krt sekunnissa
            frameRate: 1
        });
		
		// kun painetaan oikealle:
        this.anims.create({
            key: 'right',
			// aletaan toistaa spritesheet:sta kuvia 
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
			  // kuinka monta kuvaa animaatio toistaa per sekunti
            frameRate: 10,
			// animaatio "loop":
			// -1 = ikuinen looppi:
            repeat: -1
        });
	// part 6.
	// lisätään törmäyksen tunnistuks pelaajan ja tasojen välille
	
	this.physics.add.collider(player, platforms);
	// part7.
	// käytetään näppiksen nuolipainikkeisiin
	cursors = this.input.keyboard.createCursorKeys();

  // part 8.
  stars = this.physics.add.group({
            key: 'star',
			// repeat: 1 + 11 = 12
            repeat: 11,
			// x = ekan tähden keskikohta horisontaalisesti
			// y sama juttu, vertikaalisesti
			// --> 200 tarkoittaa että tähti tippuu ylempää
			// stepX --> kuinka kaukana tähdet ovat toisistaan horisontaalisesti                                                                                                                                                                                                                                                                                                                                                
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        stars.children.iterate(function (child) {
			// Bounce ->> tähden kimmoisuus
			// arvotaan 40 - 80 % alkuperäisestä voimasta
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

        });
		// tähdet ei pääse tasojen läpi
		this.physics.add.collider(stars, platforms);
		// part 8.
		// "kun pelaaja koskee tähteen", suoritetaan toiminto collectStar
		 this.physics.add.overlap(player, stars, collectStar, null, this);
		
	
	
	// part 9.
	// pistelaskurin sijainti, alkuteksti koko ja väri
	 scoreText = this.add.text(16, 16, 'this is your score. You scared yet, puny human?: 0', { fontSize: '15px', fill: '#fff' });
	 
	 // part10.
	 // myös vihollinen noudattaa pelin fysiikoita
	 bombs = this.physics.add.group();
	 // vihollinen ei pääse tasoista läpi
	 this.physics.add.collider(bombs, platforms);
	 // kun pelaaja törmää viholliseen, suoritetaan hitBomb
	  this.physics.add.collider(player, bombs, hitBomb, null, this);
	//äänet
	fx_star = this.sound.add('fx_star', {loop: false});
	fx_hit = this.sound.add('fx_hit', {loop: false});
	fx_jump = this.sound.add('fx_jump', {loop: false});
	fx_steps = this.sound.add('fx_steps', {loop: false});
	fx_background = this.sound.add('fx_background', {loop: true});
	fx_background.play();
	
	// pelaajaa seuraava kamera
	// 1. kuinka suurella kamera saa liikkua
	// 0, 0 --> vasen yläkulma
	// 1200, 800 --> oikea alakulma
	this.cameras.main.setBounds(0, 0, 1200, 800);
	// täytyy myös määrittää uusiksi fyysinen maailman mitat
	this.physics.world.setBounds(0, 0, 1200, 800);
	// kamera seuraa pelaajaa
	this.cameras.main.startFollow(player);
	// pistelaskurin tekstilaatikko seuraamaan kameraa
	scoreText.setScrollFactor(0);
	}//create päättyy
	
// peli siirtyy käynnistyksen jälkeen "peliluuppiin"
    function update ()
    {
		// part 10.
		if (gameOver)
    {
        return;
    }
		// kun pelaaja painaa <--
		 if (cursors.left.isDown)
        {
			// x-arvo pienenee: menee 160px/sekunti vasemmalle
            player.setVelocityX(-160);
			// käynnistää left animaation
            player.anims.play('left', true);
			//askeläänet (ei toimi, mutta voi myöhemmin korjata)
			fx_steps.play();
        }
		// mennään oikealle
        else if (cursors.right.isDown)
        {
            player.setVelocityX(160);

            player.anims.play('right', true);
			//askeläänet (ei toimi, mutta voi myöhemmin korjata)
			fx_steps.play();
        }
		// "idle"
        else
        {
            player.setVelocityX(0);

            player.anims.play('turn');
        }
		// hyppy
		// painetaanko nuoli ylös ja koskeeko pelaaja tasoa
        if (cursors.up.isDown && player.body.touching.down)
        {
			// hyppyvoima
            player.setVelocityY(-330);
			fx_jump.play();
		
        }
    }
	// part 8.
	// kun pelaaja ja tähti kohtaavat, suoritetaan collectStar-toiminto
	  function collectStar (player, star)
    {
		
		// juuri törmätyn tähden näkyvä body laitetaan piiloon
		// Tähti kuitenkin jää selaimen muistiin jotta se voidaan ottaa uudelleen käyttöön
        star.disableBody(true, true);
		// part 9.
		// pisteet kasvaa
		 score += 10;
        scoreText.setText('this is your score. You scared yet, puny human?:' + score);
		//kun kaikki tähdet kerätty
		if (stars.countActive(true) === 0)
    {
        //  1. näytölle "uudet" tähdet
		// ilmestyvät samaan kohtaan kuin ensimmäiset
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });
		//vihollisen x-sijainti määräytyy sen perusteella, missä pelaaja on, jotta pommi ei tipu suoraan pelaajan niskaan
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
		
		// uuden vihollisen luonti
		// x arvottiin
		// y on 16
        var bomb = bombs.create(x, 16, 'bomb');
		// vihollisen kimmoisuus on tasan yksi, jotta se pomppii tasaisesti ja loputtomasti
        bomb.setBounce(1);
		// vihollinen ei pääse seinien läpi
        bomb.setCollideWorldBounds(true);
		// arvotaan, kuinka paljon vihollinen liikkuu sivuttain
		// 20 --> enemyn y nopeus --> eli putoamisvauhti
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
		// enemyn painovoima otetaan pois päältä
        bomb.allowGravity = false;
	
    }
	//Tähden ääni
	fx_star.play();
    }// collectStar päättyy
	
// part 10.
// kun pelaaja osuu enemyyn
	function hitBomb (player, bomb)
{
	// pelaaja menee pauselle
	// vain fysiikoiden osalta --> pelaaja jumittuu paikoilleen
    this.physics.pause();
	// pelaaja muuttuu mustaksi niinkuin tuhka
    player.setTint(000000);
	// suorita kääntymisanimaatio
    player.anims.play('turn');
	// osuman ääni
	fx_hit.play();
	
	
	// peli päättyy
    gameOver = true;
	// tustamusiikki päättyy
	fx_background.stop();
}
