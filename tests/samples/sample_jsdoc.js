

/**
 * LatLong position in WSG86 coordinate system
 * @constructor {LatLong,asa}
 * @swagger {model}
 * @swagger model
 * @swagger api:{path:/task} function ass 
 * @swagger operation {{method:get,test:as}} function ass 

 */
function LatLong() {

	/**
	 * Latitude value
	 * @type {Number} 
	 */
	this.lat = 0;
	
	/**
	 * Longitude value
	 * @type {Number} 
	 */
	this.lng=0;

	/**
	 * list of ids 
	 * @type {Array.<Number>} 
	 */
	this.ids=[];

	/**
	 * need to have a foo value
	 * @type {Foo[]} 
	 */
	this.foo=0;

}

