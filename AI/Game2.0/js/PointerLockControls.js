THREE.PointerLockControls = function ( camera ) {

	var scope = this;

	var fire = false;

	camera.rotation.set( 0, 0, 0 );


	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	//var yawObject = new THREE.Object3D();
    var texture1 = new THREE.TextureLoader().load("textures/Transparentmaterial.png");
    texture1.wrapS = THREE.RepeatWrapping;
    texture1.wrapT = THREE.RepeatWrapping;
    texture1.repeat.set(1, 1);
    var material1 = new THREE.MeshPhongMaterial( { map: texture1 } );
    material1.shininess = 0;
    var yawObject = new THREE.Mesh(new THREE.BoxGeometry( 3,
        30, 3), material1);
    yawObject.position.y = 5;
    yawObject.add( pitchObject );

	var PI_2 = Math.PI / 2;


	var onMouseMove = function ( event ) {

		if ( scope.enabled === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

	};

	var onMouseDown = function (event) {
		if(event.button == 0 && !fire){
			fire = true;
		}
	}

	this.pitch = pitchObject;

	this.dispose = function() {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener('mousedown', onMouseDown, false);

	};

	document.addEventListener( 'mousemove', onMouseMove, false );
    document.addEventListener('mousedown', onMouseDown, false);

	this.enabled = false;

	this.getObject = function () {

		return yawObject;

	};

	this.getMouseClick = function() {
		return fire;
	}

	this.setMouseClick = function(bool) {
		fire = bool;
	}

	this.getDirection = function() {

		// assumes the camera itself is not rotated
		var direction = new THREE.Vector3( 0, 0, - 1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );
			return v;

		};

	}();
};
