var expect = chai.expect;

describe("Analizador CSV", function() {

  describe("Calculate", function() {
    it("Debería aceptar una cadena literal en formato CSV que represente una tabla con un elemento entre comillas", function() {
      var original = 'a,b,c,"d,e,f"\nx,y,z';
      var result = calculate(original);
      expect(result[0].items.toString()).to.equal("a,b,c,d,e,f");
    });
  });
}); 