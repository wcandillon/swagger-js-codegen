/*jshint -W069 */
'use strict';

(function() {

  /**
   * CodeEnum
   * @class CodeEnum
   * @enum {string}
   * @readonly
   * @swagger enum [ "ADMN" ,   "HER" ,   "INFO" ,   "BKDN" ,   "VI" ,   "FUEL" ,   "SMR" ,   "GLAS" ,   "KEY" ,   "LOG" ,   "PSO" ,   "UNKN"  ]
   */
  var CodeEnum = {
      ADMN: 'ADMN',
      HER: 'HER',
      INFO: 'INFO',
      BKDN: 'BKDN',
      VI: 'VI',
      FUEL: 'FUEL',
      SMR: 'SMR',
      GLAS: 'GLAS',
      KEY: 'KEY',
      LOG: 'LOG',
      PSO: 'PSO',
      UNKN: 'UNKN'
    };

  exports.module = CodeEnum;
})();