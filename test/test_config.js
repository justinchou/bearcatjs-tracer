const Should = require('chai').should();

describe("config structure", function() {
    let config;

    before(()=>{
        config = require("../config/");
    });

    it("config should ok", () => {
        config.should.be.an("object");
    });
})