import { calculateTimezoneOffset, calculateSign, calculateHours, calculateMinutes, toLocalISOString, DateConversion } from "main/components/Utils/DateConversion";

var tzdata = {
  'UTC': {
    names: [0, 'UTC'],
    transitions: [0, 0, Infinity, 0],
  },
  'Europe/London': {
    names: [0, 'GMT', 1, 'BST'],
    transitions: [
      0, 0,
      69818400, 1,
      89172000, 0,
      101268000, 1,
      120621600, 0,
      132717600, 1,
      152071200, 0,
      164167200, 1,
      183520800, 0,
      196221600, 1,
      214970400, 0,
      227671200, 1,
      246420000, 0,
      259120800, 1,
      278474400, 0,
      290570400, 1,
      309924000, 0,
      322020000, 1,
      341373600, 0,
      354675600, 1,
      372819600, 0,
      386125200, 1,
      404269200, 0,
      417574800, 1,
      435718800, 0,
      449024400, 1,
      467773200, 0,
      481078800, 1,
      499222800, 0,
      512528400, 1,
      530672400, 0,
      543978000, 1,
      562122000, 0,
      575427600, 1,
      593571600, 0,
      606877200, 1,
      625626000, 0,
      638326800, 1,
      657075600, 0,
      670381200, 1,
      688525200, 0,
      701830800, 1,
      719974800, 0,
      733280400, 1,
      751424400, 0,
      764730000, 1,
      782874000, 0,
      796179600, 1,
      814323600, 0,
      820454400, 0,
      828234000, 1,
      846378000, 0,
      859683600, 1,
      877827600, 0,
      891133200, 1,
      909277200, 0,
      922582800, 1,
      941331600, 0,
      954032400, 1,
      972781200, 0,
      985482000, 1,
      1004230800, 0,
      1017536400, 1,
      1035680400, 0,
      1048986000, 1,
      1067130000, 0,
      1080435600, 1,
      1099184400, 0,
      1111885200, 1,
      1130634000, 0,
      1143334800, 1,
      1162083600, 0,
      1174784400, 1,
      1193533200, 0,
      1206838800, 1,
      1224982800, 0,
      1238288400, 1,
      1256432400, 0,
      1269738000, 1,
      1288486800, 0,
      1301187600, 1,
      1319936400, 0,
      1332637200, 1,
      1351386000, 0,
      1364691600, 1,
      1382835600, 0,
      1396141200, 1,
      1414285200, 0,
      1427590800, 1,
      1445734800, 0,
      1459040400, 1,
      1477789200, 0,
      1490490000, 1,
      1509238800, 0,
      1521939600, 1,
      1540688400, 0,
      1553994000, 1,
      1572138000, 0,
      1585443600, 1,
      1603587600, 0,
      1616893200, 1,
      1635642000, 0,
      1648342800, 1,
      1667091600, 0,
      1679792400, 1,
      1698541200, 0,
      1711846800, 1,
      1729990800, 0,
      1743296400, 1,
      1761440400, 0,
      1774746000, 1,
      1792890000, 0,
      1806195600, 1,
      1824944400, 0,
      1837645200, 1,
      1856394000, 0,
      1869094800, 1,
      1887843600, 0,
      1901149200, 1,
      1919293200, 0,
      1932598800, 1,
      1950742800, 0,
      1964048400, 1,
      1982797200, 0,
      1995498000, 1,
      2014246800, 0,
      2026947600, 1,
      2045696400, 0,
      2058397200, 1,
      2077146000, 0,
      2090451600, 1,
      2108595600, 0,
      2121901200, 1,
      2140045200, 0,
    ],
  },
  'US/Pacific': {
    names: [-7, 'PDT', -8, 'PST'],
    transitions: [
      0, -8,
      9972000, -7,
      25693200, -8,
      41421600, -7,
      57747600, -8,
      73476000, -7,
      89197200, -8,
      104925600, -7,
      120646800, -8,
      126698400, -7,
      152096400, -8,
      162381600, -7,
      183546000, -8,
      199274400, -7,
      215600400, -8,
      230724000, -7,
      247050000, -8,
      262778400, -7,
      278499600, -8,
      294228000, -7,
      309949200, -8,
      325677600, -7,
      341398800, -8,
      357127200, -7,
      372848400, -8,
      388576800, -7,
      404902800, -8,
      420026400, -7,
      436352400, -8,
      452080800, -7,
      467802000, -8,
      483530400, -7,
      499251600, -8,
      514980000, -7,
      530701200, -8,
      544615200, -7,
      562150800, -8,
      576064800, -7,
      594205200, -8,
      607514400, -7,
      625654800, -8,
      638964000, -7,
      657104400, -8,
      671018400, -7,
      688554000, -8,
      702468000, -7,
      720003600, -8,
      733917600, -7,
      752058000, -8,
      765367200, -7,
      783507600, -8,
      796816800, -7,
      814957200, -8,
      828871200, -7,
      846406800, -8,
      860320800, -7,
      877856400, -8,
      891770400, -7,
      909306000, -8,
      923220000, -7,
      941360400, -8,
      954669600, -7,
      972810000, -8,
      986119200, -7,
      1004259600, -8,
      1018173600, -7,
      1035709200, -8,
      1049623200, -7,
      1067158800, -8,
      1081072800, -7,
      1099213200, -8,
      1112522400, -7,
      1130662800, -8,
      1143972000, -7,
      1162112400, -8,
      1173607200, -7,
      1194166800, -8,
      1205056800, -7,
      1225616400, -8,
      1236506400, -7,
      1257066000, -8,
      1268560800, -7,
      1289120400, -8,
      1300010400, -7,
      1320570000, -8,
      1331460000, -7,
      1352019600, -8,
      1362909600, -7,
      1383469200, -8,
      1394359200, -7,
      1414918800, -8,
      1425808800, -7,
      1446368400, -8,
      1457863200, -7,
      1478422800, -8,
      1489312800, -7,
      1509872400, -8,
      1520762400, -7,
      1541322000, -8,
      1552212000, -7,
      1572771600, -8,
      1583661600, -7,
      1604221200, -8,
      1615716000, -7,
      1636275600, -8,
      1647165600, -7,
      1667725200, -8,
      1678615200, -7,
      1699174800, -8,
      1710064800, -7,
      1730624400, -8,
      1741514400, -7,
      1762074000, -8,
      1772964000, -7,
      1793523600, -8,
      1805018400, -7,
      1825578000, -8,
      1836468000, -7,
      1857027600, -8,
      1867917600, -7,
      1888477200, -8,
      1899367200, -7,
      1919926800, -8,
      1930816800, -7,
      1951376400, -8,
      1962871200, -7,
      1983430800, -8,
      1994320800, -7,
      2014880400, -8,
      2025770400, -7,
      2046330000, -8,
      2057220000, -7,
      2077779600, -8,
      2088669600, -7,
      2109229200, -8,
      2120119200, -7,
      2140678800, -8,
    ],
  },
  'US/Eastern': {
    names: [-4, 'EDT', -5, 'EST'],
    transitions: [
      0, -5,
      9961200, -4,
      25682400, -5,
      41410800, -4,
      57736800, -5,
      73465200, -4,
      89186400, -5,
      104914800, -4,
      120636000, -5,
      126687600, -4,
      152085600, -5,
      162370800, -4,
      183535200, -5,
      199263600, -4,
      215589600, -5,
      230713200, -4,
      247039200, -5,
      262767600, -4,
      278488800, -5,
      294217200, -4,
      309938400, -5,
      325666800, -4,
      341388000, -5,
      357116400, -4,
      372837600, -5,
      388566000, -4,
      404892000, -5,
      420015600, -4,
      436341600, -5,
      452070000, -4,
      467791200, -5,
      483519600, -4,
      499240800, -5,
      514969200, -4,
      530690400, -5,
      544604400, -4,
      562140000, -5,
      576054000, -4,
      594194400, -5,
      607503600, -4,
      625644000, -5,
      638953200, -4,
      657093600, -5,
      671007600, -4,
      688543200, -5,
      702457200, -4,
      719992800, -5,
      733906800, -4,
      752047200, -5,
      765356400, -4,
      783496800, -5,
      796806000, -4,
      814946400, -5,
      828860400, -4,
      846396000, -5,
      860310000, -4,
      877845600, -5,
      891759600, -4,
      909295200, -5,
      923209200, -4,
      941349600, -5,
      954658800, -4,
      972799200, -5,
      986108400, -4,
      1004248800, -5,
      1018162800, -4,
      1035698400, -5,
      1049612400, -4,
      1067148000, -5,
      1081062000, -4,
      1099202400, -5,
      1112511600, -4,
      1130652000, -5,
      1143961200, -4,
      1162101600, -5,
      1173596400, -4,
      1194156000, -5,
      1205046000, -4,
      1225605600, -5,
      1236495600, -4,
      1257055200, -5,
      1268550000, -4,
      1289109600, -5,
      1299999600, -4,
      1320559200, -5,
      1331449200, -4,
      1352008800, -5,
      1362898800, -4,
      1383458400, -5,
      1394348400, -4,
      1414908000, -5,
      1425798000, -4,
      1446357600, -5,
      1457852400, -4,
      1478412000, -5,
      1489302000, -4,
      1509861600, -5,
      1520751600, -4,
      1541311200, -5,
      1552201200, -4,
      1572760800, -5,
      1583650800, -4,
      1604210400, -5,
      1615705200, -4,
      1636264800, -5,
      1647154800, -4,
      1667714400, -5,
      1678604400, -4,
      1699164000, -5,
      1710054000, -4,
      1730613600, -5,
      1741503600, -4,
      1762063200, -5,
      1772953200, -4,
      1793512800, -5,
      1805007600, -4,
      1825567200, -5,
      1836457200, -4,
      1857016800, -5,
      1867906800, -4,
      1888466400, -5,
      1899356400, -4,
      1919916000, -5,
      1930806000, -4,
      1951365600, -5,
      1962860400, -4,
      1983420000, -5,
      1994310000, -4,
      2014869600, -5,
      2025759600, -4,
      2046319200, -5,
      2057209200, -4,
      2077768800, -5,
      2088658800, -4,
      2109218400, -5,
      2120108400, -4,
      2140668000, -5,
    ],
  },
  'Brazil/East': {
    names: [-2, '-02', -3, '-03'],
    transitions: [
      0, -3,
      499748400, -2,
      511236000, -3,
      530593200, -2,
      540266400, -3,
      562129200, -2,
      571197600, -3,
      592974000, -2,
      602042400, -3,
      624423600, -2,
      634701600, -3,
      656478000, -2,
      666756000, -3,
      687927600, -2,
      697600800, -3,
      719982000, -2,
      728445600, -3,
      750826800, -2,
      761709600, -3,
      782276400, -2,
      793159200, -3,
      813726000, -2,
      824004000, -3,
      844570800, -2,
      856058400, -3,
      876106800, -2,
      888717600, -3,
      908074800, -2,
      919562400, -3,
      938919600, -2,
      951616800, -3,
      970974000, -2,
      982461600, -3,
      1003028400, -2,
      1013911200, -3,
      1036292400, -2,
      1045360800, -3,
      1066532400, -2,
      1076810400, -3,
      1099364400, -2,
      1108864800, -3,
      1129431600, -2,
      1140314400, -3,
      1162695600, -2,
      1172368800, -3,
      1192330800, -2,
      1203213600, -3,
      1224385200, -2,
      1234663200, -3,
      1255834800, -2,
      1266717600, -3,
      1287284400, -2,
      1298167200, -3,
      1318734000, -2,
      1330221600, -3,
      1350788400, -2,
      1361066400, -3,
      1382238000, -2,
      1392516000, -3,
      1413687600, -2,
      1424570400, -3,
      1445137200, -2,
      1456020000, -3,
      1476586800, -2,
      1487469600, -3,
      1508036400, -2,
      1518919200, -3,
      1541300400, -2,
      1550368800, -3,
      1572750000, -2,
      1581818400, -3,
      1604199600, -2,
      1613872800, -3,
      1636254000, -2,
      1645322400, -3,
      1667703600, -2,
      1677376800, -3,
      1699153200, -2,
      1708221600, -3,
      1730602800, -2,
      1739671200, -3,
      1762052400, -2,
      1771725600, -3,
      1793502000, -2,
      1803175200, -3,
      1825556400, -2,
      1834624800, -3,
      1857006000, -2,
      1866074400, -3,
      1888455600, -2,
      1897524000, -3,
      1919905200, -2,
      1928973600, -3,
      1951354800, -2,
      1960423200, -3,
      1983409200, -2,
      1992477600, -3,
      2014858800, -2,
      2024532000, -3,
      2046308400, -2,
      2055376800, -3,
      2077758000, -2,
      2086826400, -3,
      2109207600, -2,
      2118880800, -3,
      2140657200, -2,
    ],
  },
  'Australia/Adelaide': {
    names: [10.5, 'ACDT', 9.5, 'ACST'],
    transitions: [
      0, 9.5,
      57688200, 10.5,
      67969800, 9.5,
      89137800, 10.5,
      100024200, 9.5,
      120587400, 10.5,
      131473800, 9.5,
      152037000, 10.5,
      162923400, 9.5,
      183486600, 10.5,
      194977800, 9.5,
      215541000, 10.5,
      226427400, 9.5,
      246990600, 10.5,
      257877000, 9.5,
      278440200, 10.5,
      289326600, 9.5,
      309889800, 10.5,
      320776200, 9.5,
      341339400, 10.5,
      352225800, 9.5,
      372789000, 10.5,
      384280200, 9.5,
      404843400, 10.5,
      415729800, 9.5,
      436293000, 10.5,
      447179400, 9.5,
      467742600, 10.5,
      478629000, 9.5,
      499192200, 10.5,
      511288200, 9.5,
      530037000, 10.5,
      542737800, 9.5,
      562091400, 10.5,
      574792200, 9.5,
      594145800, 10.5,
      606241800, 9.5,
      625595400, 10.5,
      637691400, 9.5,
      657045000, 10.5,
      667931400, 9.5,
      688494600, 10.5,
      701195400, 9.5,
      719944200, 10.5,
      731435400, 9.5,
      751998600, 10.5,
      764094600, 9.5,
      783448200, 10.5,
      796149000, 9.5,
      814897800, 10.5,
      828203400, 9.5,
      846347400, 10.5,
      859653000, 9.5,
      877797000, 10.5,
      891102600, 9.5,
      909246600, 10.5,
      922552200, 9.5,
      941301000, 10.5,
      954001800, 9.5,
      972750600, 10.5,
      985451400, 9.5,
      1004200200, 10.5,
      1017505800, 9.5,
      1035649800, 10.5,
      1048955400, 9.5,
      1067099400, 10.5,
      1080405000, 9.5,
      1099153800, 10.5,
      1111854600, 9.5,
      1130603400, 10.5,
      1143909000, 9.5,
      1162053000, 10.5,
      1174753800, 9.5,
      1193502600, 10.5,
      1207413000, 9.5,
      1223137800, 10.5,
      1238862600, 9.5,
      1254587400, 10.5,
      1270312200, 9.5,
      1286037000, 10.5,
      1301761800, 9.5,
      1317486600, 10.5,
      1333211400, 9.5,
      1349541000, 10.5,
      1365265800, 9.5,
      1380990600, 10.5,
      1396715400, 9.5,
      1412440200, 10.5,
      1428165000, 9.5,
      1443889800, 10.5,
      1459614600, 9.5,
      1475339400, 10.5,
      1491064200, 9.5,
      1506789000, 10.5,
      1522513800, 9.5,
      1538843400, 10.5,
      1554568200, 9.5,
      1570293000, 10.5,
      1586017800, 9.5,
      1601742600, 10.5,
      1617467400, 9.5,
      1633192200, 10.5,
      1648917000, 9.5,
      1664641800, 10.5,
      1680366600, 9.5,
      1696091400, 10.5,
      1712421000, 9.5,
      1728145800, 10.5,
      1743870600, 9.5,
      1759595400, 10.5,
      1775320200, 9.5,
      1791045000, 10.5,
      1806769800, 9.5,
      1822494600, 10.5,
      1838219400, 9.5,
      1853944200, 10.5,
      1869669000, 9.5,
      1885998600, 10.5,
      1901723400, 9.5,
      1917448200, 10.5,
      1933173000, 9.5,
      1948897800, 10.5,
      1964622600, 9.5,
      1980347400, 10.5,
      1996072200, 9.5,
      2011797000, 10.5,
      2027521800, 9.5,
      2043246600, 10.5,
      2058971400, 9.5,
      2075301000, 10.5,
      2091025800, 9.5,
      2106750600, 10.5,
      2122475400, 9.5,
      2138200200, 10.5,
    ],
  },
  'Etc/GMT+12': {
    names: [-12, '-12'],
    transitions: [
      0, -12,
      Infinity, -12,
    ],
  },
  'Etc/GMT+11': {
    names: [-11, '-11'],
    transitions: [
      0, -11,
      Infinity, -11,
    ],
  },
  'Etc/GMT+10': {
    names: [-10, '-10'],
    transitions: [
      0, -10,
      Infinity, -10,
    ],
  },
  'Etc/GMT+9': {
    names: [-9, '-09'],
    transitions: [
      0, -9,
      Infinity, -9,
    ],
  },
  'Etc/GMT+8': {
    names: [-8, '-08'],
    transitions: [
      0, -8,
      Infinity, -8,
    ],
  },
  'Etc/GMT+7': {
    names: [-7, '-07'],
    transitions: [
      0, -7,
      Infinity, -7,
    ],
  },
  'Etc/GMT+6': {
    names: [-6, '-06'],
    transitions: [
      0, -6,
      Infinity, -6,
    ],
  },
  'Etc/GMT+5': {
    names: [-5, '-05'],
    transitions: [
      0, -5,
      Infinity, -5,
    ],
  },
  'Etc/GMT+4': {
    names: [-4, '-04'],
    transitions: [
      0, -4,
      Infinity, -4,
    ],
  },
  'Etc/GMT+3': {
    names: [-3, '-03'],
    transitions: [
      0, -3,
      Infinity, -3,
    ],
  },
  'Etc/GMT+2': {
    names: [-2, '-02'],
    transitions: [
      0, -2,
      Infinity, -2,
    ],
  },
  'Etc/GMT+1': {
    names: [-1, '-01'],
    transitions: [
      0, -1,
      Infinity, -1,
    ],
  },
  'Etc/GMT+0': {
    names: [0, 'GMT'],
    transitions: [
      0, 0,
      Infinity, 0,
    ],
  },
  'Etc/GMT': {
    names: [0, 'GMT'],
    transitions: [
      0, 0,
      Infinity, 0,
    ],
  },
  'Etc/GMT-0': {
    names: [0, 'GMT'],
    transitions: [
      0, 0,
      Infinity, 0,
    ],
  },
  'Etc/GMT-1': {
    names: [1, '+01'],
    transitions: [
      0, 1,
      Infinity, 1,
    ],
  },
  'Etc/GMT-2': {
    names: [2, '+02'],
    transitions: [
      0, 2,
      Infinity, 2,
    ],
  },
  'Etc/GMT-3': {
    names: [3, '+03'],
    transitions: [
      0, 3,
      Infinity, 3,
    ],
  },
  'Etc/GMT-4': {
    names: [4, '+04'],
    transitions: [
      0, 4,
      Infinity, 4,
    ],
  },
  'Etc/GMT-5': {
    names: [5, '+05'],
    transitions: [
      0, 5,
      Infinity, 5,
    ],
  },
  'Etc/GMT-6': {
    names: [6, '+06'],
    transitions: [
      0, 6,
      Infinity, 6,
    ],
  },
  'Etc/GMT-7': {
    names: [7, '+07'],
    transitions: [
      0, 7,
      Infinity, 7,
    ],
  },
  'Etc/GMT-8': {
    names: [8, '+08'],
    transitions: [
      0, 8,
      Infinity, 8,
    ],
  },
  'Etc/GMT-9': {
    names: [9, '+09'],
    transitions: [
      0, 9,
      Infinity, 9,
    ],
  },
  'Etc/GMT-10': {
    names: [10, '+10'],
    transitions: [
      0, 10,
      Infinity, 10,
    ],
  },
  'Etc/GMT-11': {
    names: [11, '+11'],
    transitions: [
      0, 11,
      Infinity, 11,
    ],
  },
  'Etc/GMT-12': {
    names: [12, '+12'],
    transitions: [
      0, 12,
      Infinity, 12,
    ],
  },
  'Etc/GMT-13': {
    names: [13, '+13'],
    transitions: [
      0, 13,
      Infinity, 13,
    ],
  },
  'Etc/GMT-14': {
    names: [14, '+14'],
    transitions: [
      0, 14,
      Infinity, 14,
    ],
  },
};
const RealDate = Date;

'use strict';

var assert = require('assert');

var _Date = null;
exports._Date = Date;

var mockDateOptions = {};

var timezone;

var weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

var HOUR = 60 * 60 * 1000;

var date_iso_8601_regex = /^\d\d\d\d(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d\d\d)?(\d\d\d)?(Z|[+-]\d\d:?\d\d))?)?)?$/;
var date_with_offset = /^\d\d\d\d-\d\d-\d\d( \d\d:\d\d:\d\d(\.\d\d\d)? )?(Z|(-|\+|)\d\d:\d\d)$/;
var date_rfc_2822_regex = /^\d\d-\w\w\w-\d\d\d\d \d\d:\d\d:\d\d (\+|-)\d\d\d\d$/;
var local_date_regex = /^\d\d\d\d-\d\d-\d\d[T ]\d\d:\d\d(:\d\d(\.\d\d\d)?)?$/;
var local_GMT_regex = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), \d\d \w\w\w \d\d\d\d \d\d:\d\d:\d\d GMT$/

function MockDate(param) {
  if (arguments.length === 0) {
    this.d = new _Date();
  } else if (arguments.length === 1) {
    if (param instanceof MockDate) {
      this.d = new _Date(param.d);
    } else if (typeof param === 'string') {
      if (param.match(date_iso_8601_regex) ||
        param.match(date_with_offset) ||
        param.match(date_rfc_2822_regex) ||
        param.match(local_GMT_regex) ||
        param === ''
      ) {
        this.d = new _Date(param);
      } else if (param.match(local_date_regex)) {
        this.d = new _Date();
        this.fromLocal(new _Date(param.replace(' ', 'T') + 'Z'));
      } else if (mockDateOptions.fallbackFn) {
        this.d = mockDateOptions.fallbackFn(param);
      } else {
        assert.ok(false, 'Unhandled date format passed to MockDate constructor: ' + param);
      }
    } else if (typeof param === 'number' || param === null || param === undefined) {
      this.d = new _Date(param);
    } else if (mockDateOptions.fallbackFn) {
      this.d = mockDateOptions.fallbackFn(param);
    } else {
      assert.ok(false, 'Unhandled type passed to MockDate constructor: ' + typeof param);
    }
  } else {
    this.d = new _Date();
    this.fromLocal(new _Date(_Date.UTC.apply(null, arguments)));
  }
}

// eslint-disable-next-line consistent-return
MockDate.prototype.calcTZO = function (ts) {
  var data = tzdata[timezone];
  assert.ok(data, 'Unsupported timezone: ' + timezone);
  ts = (ts || this.d.getTime()) / 1000;
  if (Number.isNaN(ts)) {
    return NaN;
  }
  for (var ii = 2; ii < data.transitions.length; ii += 2) {
    if (data.transitions[ii] > ts) {
      return -data.transitions[ii - 1];
    }
  }
  // note: should never reach here!
  assert.ok(false, ts);
};

function passthrough(fn) {
  MockDate.prototype[fn] = function () {
    var real_date;
    if (this instanceof MockDate) {
      real_date = this.d;
    } else if (this instanceof _Date) {
      // console.log calls our prototype to format regular Date objects!
      // This should only be hit while debugging MockDate itself though, as
      // there should be no _Date objects in user code when using MockDate.
      real_date = this;
    } else {
      assert(false, 'Unexpected object type');
    }
    return real_date[fn].apply(real_date, arguments);
  };
}
function localgetter(fn) {
  MockDate.prototype[fn] = function () {
    if (Number.isNaN(this.d.getTime())) {
      return NaN;
    }
    var d = new _Date(this.d.getTime() - this.calcTZO() * HOUR);
    return d['getUTC' + fn.slice(3)]();
  };
}
MockDate.prototype.fromLocal = function (d) {
  // From a Date object in the fake-timezone where the returned UTC values are
  //   meant to be interpreted as local values.
  this.d.setTime(d.getTime() + this.calcTZO(d.getTime() + this.calcTZO(d.getTime()) * HOUR) * HOUR);
};
function localsetter(fn) {
  MockDate.prototype[fn] = function () {
    var d = new _Date(this.d.getTime() - this.calcTZO() * HOUR);
    d['setUTC' + fn.slice(3)].apply(d, arguments);
    this.fromLocal(d);
    return this.getTime();
  };
}
[
  'getUTCDate',
  'getUTCDay',
  'getUTCFullYear',
  'getUTCHours',
  'getUTCMilliseconds',
  'getUTCMinutes',
  'getUTCMonth',
  'getUTCSeconds',
  'getTime',
  'setTime',
  'setUTCDate',
  'setUTCFullYear',
  'setUTCHours',
  'setUTCMilliseconds',
  'setUTCMinutes',
  'setUTCMonth',
  'setUTCSeconds',
  'toGMTString',
  'toISOString',
  'toJSON',
  'toUTCString',
  'valueOf',
].forEach(passthrough);
[
  'getDate',
  'getDay',
  'getFullYear',
  'getHours',
  'getMilliseconds',
  'getMinutes',
  'getMonth',
  'getSeconds',
].forEach(localgetter);
[
  'setDate',
  'setFullYear',
  'setHours',
  'setMilliseconds',
  'setMinutes',
  'setMonth',
  'setSeconds',
].forEach(localsetter);

MockDate.prototype.getYear = function () {
  return this.getFullYear() - 1900;
};

MockDate.prototype.setYear = function (yr) {
  if (yr < 1900) {
    return this.setFullYear(1900 + yr);
  }
  return this.setFullYear(yr);
};

MockDate.parse = function (dateString) {
  return new MockDate(dateString).getTime();
};

MockDate.prototype.getTimezoneOffset = function () {
  if (Number.isNaN(this.d.getTime())) {
    return NaN;
  }
  return this.calcTZO() * 60;
};

MockDate.prototype.toString = function () {
  if (this instanceof _Date) {
    // someone, like util.inspect, calling Date.prototype.toString.call(foo)
    return _Date.prototype.toString.call(this);
  }
  if (Number.isNaN(this.d.getTime())) {
    return new _Date('').toString();
  }
  var str = [this.d.toISOString() + ' UTC (MockDate: GMT'];
  var tzo = -this.calcTZO();
  if (tzo < 0) {
    str.push('-');
    tzo *= -1;
  } else {
    str.push('+');
  }
  str.push(Math.floor(tzo).toString().padStart(2, '0'));
  tzo -= Math.floor(tzo);
  if (tzo) {
    str.push(tzo * 60);
  } else {
    str.push('00');
  }
  str.push(')');
  return str.join('');
};

MockDate.now = function () { return _Date.now() };

MockDate.UTC = function () { return _Date.UTC.apply(_Date, arguments) };

MockDate.prototype.toDateString = function () {
  if (Number.isNaN(this.d.getTime())) {
    return new _Date('').toDateString();
  }
  return weekDays[this.getDay()] + ' ' + months[this.getMonth()] + ' ' +
    this.getDate().toString().padStart(2, '0') + ' ' + this.getFullYear();
};

MockDate.prototype.toLocaleString = function (locales, options) {
  options = Object.assign({ timeZone: timezone }, options);
  var time = this.d.getTime();
  if (Number.isNaN(time)) {
    return new _Date('').toDateString();
  }
  return new _Date(time).toLocaleString(locales, options);
};

MockDate.prototype.toLocaleDateString = function (locales, options) {
  options = Object.assign({ timeZone: timezone }, options);
  var time = this.d.getTime();
  if (Number.isNaN(time)) {
    return new _Date('').toDateString();
  }
  return new _Date(time).toLocaleDateString(locales, options);
};

MockDate.prototype.toLocaleTimeString = function (locales, options) {
  options = Object.assign({ timeZone: timezone }, options);
  var time = this.d.getTime();
  if (Number.isNaN(time)) {
    return new _Date('').toDateString();
  }
  return new _Date(time).toLocaleTimeString(locales, options);
};

// TODO:
// 'toTimeString',

function options(opts) {
  mockDateOptions = opts || {};
}
exports.options = options;

var orig_object_toString;
function mockDateObjectToString() {
  if (this instanceof MockDate) {
    // Look just like a regular Date to anything doing very low-level Object.prototype.toString calls
    // See: https://github.com/Jimbly/timezone-mock/issues/48
    return '[object Date]';
  }
  return orig_object_toString.call(this);
}

function register(new_timezone, glob) {
  if (!glob) {
    if (typeof window !== 'undefined') {
      glob = window;
    } else {
      glob = global;
    }
  }
  timezone = new_timezone || 'US/Pacific';
  if (glob.Date !== MockDate) {
    _Date = glob.Date;
    exports._Date = glob.Date;
  }
  glob.Date = MockDate;
  if (!orig_object_toString) {
    orig_object_toString = Object.prototype.toString;
    Object.prototype.toString = mockDateObjectToString;
  }
}
exports.register = register;

function unregister(glob) {
  if (!glob) {
    if (typeof window !== 'undefined') {
      glob = window;
    } else {
      glob = global;
    }
  }
  if (glob.Date === MockDate) {
    assert(_Date);
    glob.Date = _Date;
  }
}
exports.unregister = unregister;

beforeAll(() => {
  register('US/Pacific');
});

afterAll(() => {
  unregister();
});





function mockTimezone(timezoneOffsetMinutes) {
    global.Date = class extends RealDate {
        constructor(...args) {
            if (args.length === 0) {
                super();
            } else {
                super(...args);
            }
        }

        getTimezoneOffset() {
            return timezoneOffsetMinutes;
        }

        static now() {
            return RealDate.now();
        }

        static UTC(...args) {
            return RealDate.UTC(...args);
        }
    };
}



describe('Arithmetic Operator Functions', () => {
    it('correctly calculates the timezone offset', () => {
      const date = new Date('2024-05-18T10:00:00.000+08:00');
      const offset = calculateTimezoneOffset(date);
      expect(offset).toBe(-420);
    });

    it('correctly calculates the sign for positive offset', () => {
      const offset = 300;
      const sign = calculateSign(offset);
      expect(sign).toBe('+');
    });

    it('correctly calculates the sign for negative offset', () => {
      const offset = -480;
      const sign = calculateSign(offset);
      expect(sign).toBe('-');
    });

    it('correctly calculates the sign for zero offset', () => {
      const offset = 0;
      const sign = calculateSign(offset);
      expect(sign).toBe('+');
    });

    it('correctly calculates hours for positive offset', () => {
      const offset = 300;
      const hours = calculateHours(offset);
      expect(hours).toBe('05');
    });

    it('correctly calculates hours for negative offset', () => {
      const offset = -480;
      const hours = calculateHours(offset);
      expect(hours).toBe('08');
    });

    it('correctly calculates hours for zero offset', () => {
      const offset = 0;
      const hours = calculateHours(offset);
      expect(hours).toBe('00');
    });

    it('correctly calculates the sign for -0 offset', () => {
        const offset = -0;
        const sign = calculateSign(offset);
        expect(sign).toBe('+');
    });

    it('correctly calculates the sign for +0 offset', () => {
        const offset = +0;
        const sign = calculateSign(offset);
        expect(sign).toBe('+');
    });

    it('correctly calculates minutes for positive offset', () => {
        const offset = 300;
        const minutes = calculateMinutes(offset);
        expect(minutes).toBe('00');
    });

    it('correctly calculates minutes for negative offset', () => {
      const offset = -480;
      const minutes = calculateMinutes(offset);
      expect(minutes).toBe('00');
    });

    it('correctly calculates minutes for non-zero offset', () => {
      const offset = -345;
      const minutes = calculateMinutes(offset);
      expect(minutes).toBe('45');
    });
  });

describe('toLocalISOString', () => {
  it('correctly formats a date to local ISO string', () => {
    const date = new Date('2024-05-18T10:00:00.000Z');
    const localISO = toLocalISOString(date);

    const expectedISO = '2024-05-18T03:00:00.00-07:00';

    expect(localISO).toBe(expectedISO);
  });

  it('handles dates at the start of the year correctly', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    const localISO = toLocalISOString(date);

    const expectedISO = '2023-12-31T16:00:00.00-08:00';

    expect(localISO).toBe(expectedISO);
  });

  it('handles dates at the end of the year correctly', () => {
    const date = new Date('2024-12-31T23:59:59.999Z');
    const localISO = toLocalISOString(date);

    const expectedISO = '2024-12-31T15:59:59.999-08:00';

    expect(localISO).toBe(expectedISO);
  });

  it('handles dates with daylight saving time changes correctly', () => {
    const date = new Date('2024-03-10T02:30:00.000Z');
    const localISO = toLocalISOString(date);

    const expectedISO = '2024-03-09T18:30:00.00-08:00';

    expect(localISO).toBe(expectedISO);
  });
});

describe('DateConversion', () => {
  it('should return the correct today date', () => {
    const date = new Date('2024-05-22T00:00:00.000Z');
    const [today, nextMonth] = DateConversion(date);
    expect(today).toBe('2024-05-21');
    expect(nextMonth).toBe('2024-06-21');
  });

});