/*jshint -W069 */
'use strict';

(function() {

/**
 *
 * @class IdDto
 * @swagger model
 */
 function IdDto() {



/**
 *
 * @type { integer }
 */
this.id=null;

/**
 * The adjustment tax details
 * @type { TaxDetail[] }
 */
this.taxDetails=[];

this.user='user';
this.mongolab='mongolab';
this.T8msec='28msec';
this.local='local';
this.none='none';


 }

exports.module=IdDto;


 })();