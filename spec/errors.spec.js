const fs = require('fs');
require('should');
const parser = require('../lib/main.js');

describe('parsing simple errors', function() {
  let stdout = null;
  before(function() {
    stdout = fs
      .readFileSync(__dirname + '/1_simple.txt', { encoding: 'utf-8' })
      .replace(/\r\n/g, '\n');
  });
  it('should return an object', function() {
    const output = parser.parseString(stdout);

    output.length.should.equal(1);
    output[0].filename.should.equal('HolidayButton.cpp');
    output[0].line.should.equal(4);
    output[0].column.should.equal(37);
    output[0].type.should.equal('fatal error');
    output[0].text.should.equal(
      'SparkButton/SparkButton.h: No such file or directory'
    );
    output[0].code.should.equal(
      'void onCheer(const char *topic, const char *data);'
    );
    output[0].adjustedColumn.should.equal(36);
    output[0].startIndex.should.equal(0);
    output[0].endIndex.should.equal(180);
  });
});

describe('parsing multiple errors', function() {
  let stdout = null;
  before(function() {
    stdout = fs
      .readFileSync(__dirname + '/2_multiple.txt', { encoding: 'utf-8' })
      .replace(/\r\n/g, '\n');
  });
  it('should return an object', function() {
    const output = parser.parseString(stdout);

    output.length.should.equal(5);
    for (i = 0; i < 5; i++) {
      output[i].filename.should.equal('Blink.cpp');
    }
    output[1].parentFunction.should.equal('void setup()');
    output[1].startIndex.should.equal(120);
    output[1].endIndex.should.equal(228);
  });
});

describe('parsing advanced errors', function() {
  let stdout = null;
  before(function() {
    stdout = fs.readFileSync(__dirname + '/3_advanced.txt');
  });
  it('should return an object', function() {
    const output = parser.parseString(stdout);
    // TODO: Parse inclusion stack
    output.length.should.equal(3);
    output[0].type.should.equal('error');
    output[1].type.should.equal('note');
    output[2].type.should.equal('error');
  });
});

describe('parsing linker errors', function() {
  let stdout = null;
  before(function() {
    stdout = fs.readFileSync(__dirname + '/6_linker.txt');
  });
  it('should return an object', function() {
    const output = parser.parseString(stdout);
    i = 3;
    output.length.should.equal(17);
    output[i].type.should.equal('error');
    output[i].subtype.should.equal('undefined reference');
    output[i].filename.should.equal('/workspace/dispatcher.cpp');
    output[i].line.should.equal(27);
    output[i].column.should.equal(0);
    output[i].text.should.equal('undefined reference to "vtable for Logger"');
    output[i].affectedSymbol.should.equal('vtable for Logger');
    output[i].parentFunction.should.equal('Dispatcher::setLog(Logger*)');

    i += 3;
    output[i].subtype.should.equal('multiple definition');
    output[i].parentFunction.should.equal('IntervalTimer::isAllocated_SIT()');
    output[i].firstDefined.filename.should.equal('SparkIntervalTimer.cpp');
    output[i].firstDefined.line.should.equal(61);
  });
});

describe('parsing 0.6.0 errors', function() {
  let stdout = null;
  before(function() {
    stdout = fs.readFileSync(__dirname + '/8_dray_0.6.0.txt');
  });
  it('should return an object', function() {
    const output = parser.parseString(stdout);

    output.length.should.equal(7);
    output[5].type.should.equal('error');
    output[5].filename.should.equal('emptyerror.ino');
    output[5].line.should.equal(23);
    output[5].column.should.equal(34);
    output[5].text.should.equal("'count' was not declared in this scope");
    output[6].type.should.equal('error');
    output[6].filename.should.equal('emptyerror.ino');
    output[6].line.should.equal(27);
    output[6].column.should.equal(5);
    output[6].text.should.equal("'count' was not declared in this scope");
  });
});

describe('parsing with CRLF (window)', function() {
  let stdout = null;
  before(function() {
    stdout = fs
      .readFileSync(__dirname + '/1_simple.txt', { encoding: 'utf-8' })
      .replace(/\r?\n/g, '\r\n');
  });
  it('should return an object', function() {
    const output = parser.parseString(stdout);

    output.length.should.equal(1);
    output[0].filename.should.equal('HolidayButton.cpp');
    output[0].line.should.equal(4);
    output[0].column.should.equal(37);
    output[0].type.should.equal('fatal error');
    output[0].text.should.equal(
      'SparkButton/SparkButton.h: No such file or directory'
    );
    output[0].code.should.equal(
      'void onCheer(const char *topic, const char *data);'
    );
    output[0].adjustedColumn.should.equal(36);
    output[0].startIndex.should.equal(0);
    output[0].endIndex.should.equal(182);
  });
});

describe('parsing token length', function() {
  let stdout = null;
  before(function() {
    stdout = fs
      .readFileSync(__dirname + '/9_token_length.txt', {
        encoding: 'utf-8'
      })
      .replace(/\r\n/g, '\n');
  });
  it('should return an object with length property', function() {
    const output = parser.parseString(stdout);

    output.length.should.equal(1);
    output[0].filename.should.equal('/sketch/sketch.ino');
    output[0].line.should.equal(7);
    output[0].column.should.equal(3);
    output[0].type.should.equal('error');
    output[0].text.should.equal(
      `'ddigitalWrite' was not declared in this scope`
    );
    output[0].code.should.equal('ddigitalWrite(LED_BUILTIN, HIGH);');
    output[0].adjustedColumn.should.equal(0);
    output[0].startIndex.should.equal(47);
    output[0].endIndex.should.equal(178);
    output[0].tokenLength.should.equal(13);
  });
});

describe('error marker prefixed by ~', () => {
  let stdout = null;
  before(() => {
    stdout = fs
      .readFileSync(__dirname + '/10_middle_marker.txt', {
        encoding: 'utf-8'
      })
      .replace(/\r\n/g, '\n');
  });
  it('should match the error correctly', () => {
    const output = parser.parseString(stdout);

    output.length.should.equal(1);
    output[0].filename.should.equal('/sketch/sketch.ino');
    output[0].line.should.equal(14);
    output[0].column.should.equal(44);
    output[0].type.should.equal('error');
    output[0].text.should.equal(
      `invalid operands of types 'float' and 'float' to binary 'operator|'`
    );
    output[0].code.should.equal(
      'float myRebuildFloat = (float) ((float)(b1)|(float)(b2<<8)|(float)(b3<<16)|(float)(b4<<24));'
    );
    output[0].adjustedColumn.should.equal(43);
    output[0].startIndex.should.equal(48);
    output[0].endIndex.should.equal(302);
    output[0].tokenLength.should.equal(26);
  });
});

describe('parsing gcc 9.2 errors', () => {
  let stdout = null;
  before(() => {
    stdout = fs.readFileSync(__dirname + '/9_gcc_9.2.txt');
  });
  it('should return an object', () => {
    const output = parser.parseString(stdout);

    output.length.should.equal(14);
    output[11].type.should.equal('error');
    output[11].filename.should.equal('201204_fc_recv_1.ino');
    output[11].line.should.equal(583);
    output[11].column.should.equal(5);
    output[11].text.should.equal(`expected declaration before '}' token`);
  });
});
