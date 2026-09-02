// Word pools used to synthesize records. Nothing here refers to a real person.
// Surnames and given names are common enough to be generic; every combination
// produced by the generator is fictional by construction.

export const FIRST_M = [
  'James','Robert','Michael','David','William','Richard','Joseph','Thomas','Charles','Daniel',
  'Matthew','Anthony','Mark','Donald','Steven','Andrew','Joshua','Kenneth','Kevin','Brian',
  'Timothy','Ronald','George','Jason','Edward','Jeffrey','Ryan','Jacob','Nicholas','Eric',
  'Jonathan','Stephen','Larry','Justin','Scott','Brandon','Benjamin','Samuel','Gregory','Alexander',
  'Patrick','Frank','Raymond','Jack','Dennis','Jerry','Tyler','Aaron','Jose','Adam',
  'Nathan','Henry','Zachary','Douglas','Peter','Kyle','Noah','Ethan','Jeremy','Walter',
  'Christian','Keith','Roger','Terry','Austin','Sean','Gerald','Carl','Harold','Dylan',
  'Arthur','Lawrence','Jordan','Jesse','Bryan','Billy','Bruce','Gabriel','Joe','Logan',
  'Alan','Juan','Albert','Willie','Elijah','Wayne','Randy','Vincent','Mason','Roy',
  'Ralph','Bobby','Russell','Bradley','Philip','Eugene','Marcus','Devin','Omar','Andre'
];

export const FIRST_F = [
  'Mary','Patricia','Jennifer','Linda','Elizabeth','Barbara','Susan','Jessica','Sarah','Karen',
  'Lisa','Nancy','Betty','Margaret','Sandra','Ashley','Kimberly','Emily','Donna','Michelle',
  'Carol','Amanda','Dorothy','Melissa','Deborah','Stephanie','Rebecca','Sharon','Laura','Cynthia',
  'Amy','Kathleen','Angela','Shirley','Brenda','Emma','Anna','Pamela','Nicole','Samantha',
  'Katherine','Christine','Helen','Debra','Rachel','Carolyn','Janet','Maria','Catherine','Heather',
  'Diane','Olivia','Julie','Joyce','Victoria','Ruth','Virginia','Lauren','Kelly','Christina',
  'Joan','Evelyn','Judith','Andrea','Hannah','Megan','Cheryl','Jacqueline','Martha','Madison',
  'Teresa','Gloria','Sara','Janice','Ann','Kathryn','Abigail','Sophia','Frances','Jean',
  'Alice','Judy','Isabella','Julia','Grace','Amber','Denise','Danielle','Marilyn','Beverly',
  'Charlotte','Natalie','Theresa','Diana','Brittany','Doris','Kayla','Alexis','Lori','Marie'
];

export const MIDDLE = [
  'A','B','C','D','E','J','K','L','M','N','P','R','S','T','W',
  'Lee','Ray','Ann','Marie','Jean','Lynn','Rose','James','John','Paul',
  'Grace','Dean','Wayne','Scott','Elise','Cole','Reid','Faye','Blake','Quinn'
];

export const LAST = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez',
  'Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin',
  'Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson',
  'Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores',
  'Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts',
  'Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes',
  'Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper',
  'Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson',
  'Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes',
  'Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez',
  'Powell','Jenkins','Perry','Russell','Sullivan','Bell','Coleman','Butler','Henderson','Barnes',
  'Fisher','Vasquez','Simmons','Romero','Jordan','Patterson','Alexander','Hamilton','Graham','Reynolds'
];

// Each entry: [city, state abbreviation, region tag used to cluster moves]
export const CITIES = [
  ['Phoenix','AZ','SW'],['Tucson','AZ','SW'],['Mesa','AZ','SW'],['Scottsdale','AZ','SW'],
  ['Los Angeles','CA','W'],['San Diego','CA','W'],['San Jose','CA','W'],['Fresno','CA','W'],
  ['Sacramento','CA','W'],['Long Beach','CA','W'],['Oakland','CA','W'],['Bakersfield','CA','W'],
  ['Denver','CO','MW'],['Colorado Springs','CO','MW'],['Aurora','CO','MW'],
  ['Jacksonville','FL','SE'],['Miami','FL','SE'],['Tampa','FL','SE'],['Orlando','FL','SE'],
  ['St. Petersburg','FL','SE'],['Hialeah','FL','SE'],['Tallahassee','FL','SE'],
  ['Atlanta','GA','SE'],['Augusta','GA','SE'],['Savannah','GA','SE'],['Columbus','GA','SE'],
  ['Chicago','IL','MW'],['Aurora','IL','MW'],['Naperville','IL','MW'],['Peoria','IL','MW'],
  ['Indianapolis','IN','MW'],['Fort Wayne','IN','MW'],
  ['Wichita','KS','MW'],['Overland Park','KS','MW'],
  ['Louisville','KY','SE'],['Lexington','KY','SE'],
  ['New Orleans','LA','SE'],['Baton Rouge','LA','SE'],['Shreveport','LA','SE'],
  ['Boston','MA','NE'],['Worcester','MA','NE'],['Springfield','MA','NE'],
  ['Baltimore','MD','NE'],['Columbia','MD','NE'],
  ['Detroit','MI','MW'],['Grand Rapids','MI','MW'],['Ann Arbor','MI','MW'],
  ['Minneapolis','MN','MW'],['St. Paul','MN','MW'],['Rochester','MN','MW'],
  ['Kansas City','MO','MW'],['St. Louis','MO','MW'],['Springfield','MO','MW'],
  ['Charlotte','NC','SE'],['Raleigh','NC','SE'],['Greensboro','NC','SE'],['Durham','NC','SE'],
  ['Omaha','NE','MW'],['Lincoln','NE','MW'],
  ['Newark','NJ','NE'],['Jersey City','NJ','NE'],['Paterson','NJ','NE'],
  ['Albuquerque','NM','SW'],['Las Cruces','NM','SW'],
  ['Las Vegas','NV','SW'],['Henderson','NV','SW'],['Reno','NV','SW'],
  ['New York','NY','NE'],['Buffalo','NY','NE'],['Rochester','NY','NE'],['Syracuse','NY','NE'],
  ['Columbus','OH','MW'],['Cleveland','OH','MW'],['Cincinnati','OH','MW'],['Toledo','OH','MW'],
  ['Oklahoma City','OK','SW'],['Tulsa','OK','SW'],
  ['Portland','OR','W'],['Eugene','OR','W'],['Salem','OR','W'],
  ['Philadelphia','PA','NE'],['Pittsburgh','PA','NE'],['Allentown','PA','NE'],
  ['Providence','RI','NE'],
  ['Charleston','SC','SE'],['Columbia','SC','SE'],
  ['Nashville','TN','SE'],['Memphis','TN','SE'],['Knoxville','TN','SE'],['Chattanooga','TN','SE'],
  ['Houston','TX','SW'],['San Antonio','TX','SW'],['Dallas','TX','SW'],['Austin','TX','SW'],
  ['Fort Worth','TX','SW'],['El Paso','TX','SW'],['Arlington','TX','SW'],['Plano','TX','SW'],
  ['Salt Lake City','UT','SW'],['Provo','UT','SW'],
  ['Virginia Beach','VA','SE'],['Richmond','VA','SE'],['Norfolk','VA','SE'],['Arlington','VA','SE'],
  ['Seattle','WA','W'],['Spokane','WA','W'],['Tacoma','WA','W'],['Vancouver','WA','W'],
  ['Milwaukee','WI','MW'],['Madison','WI','MW'],['Green Bay','WI','MW']
];

export const STREETS = [
  'Maple','Oak','Cedar','Pine','Elm','Willow','Birch','Aspen','Juniper','Magnolia',
  'Sycamore','Chestnut','Walnut','Hickory','Laurel','Poplar','Spruce','Dogwood',
  'Sunset','Sunrise','Meadow','Prairie','Ridge','Summit','Valley','Brook','Creek','River',
  'Lakeview','Hillcrest','Fairview','Highland','Woodland','Parkside','Riverside','Brookside',
  'Franklin','Jefferson','Madison','Lincoln','Jackson','Monroe','Adams','Wilson','Harrison',
  'Church','School','Market','Union','Center','Liberty','Independence','Heritage','Colonial'
];

export const STREET_TYPE = ['St','Ave','Rd','Dr','Ln','Ct','Way','Blvd','Ter','Pl','Cir','Trl'];

export const UNIT_TYPE = ['Apt','Unit','Ste','#'];

export const EMAIL_HOSTS = [
  'mailbox.example','inbox.example','postbox.example','relaymail.example',
  'quickmail.example','northmail.example','harbormail.example','pinepost.example'
];

export const EMPLOYERS = [
  'Ridgeline Logistics','Cobalt Systems','Harborview Medical Group','Pinegrove Foods',
  'Northstar Insurance','Bluewater Construction','Summit Educational Services','Aster Retail Group',
  'Fairmount Manufacturing','Lantern Software','Clearfield Utilities','Copperline Freight',
  'Windrow Agriculture','Stonebridge Financial','Kestrel Aviation Services','Marigold Hospitality',
  'Ironwood Security','Beacon Public Works','Tidewater Marine Supply','Overland Transit Authority',
  'Verdant Landscaping','Quarry Hill Materials','Silverbrook Dental Partners','Halcyon Media',
  'Trellis Staffing','Baymont Auto Group','Cardinal Print Works','Elmhurst Senior Living'
];

export const JOB_TITLES = [
  'Operations Manager','Registered Nurse','Software Engineer','Account Executive','Store Manager',
  'Warehouse Supervisor','Elementary Teacher','Field Technician','Administrative Assistant',
  'Project Coordinator','Licensed Electrician','Financial Analyst','Customer Service Lead',
  'Dental Hygienist','Route Driver','Quality Inspector','Marketing Specialist','Paralegal',
  'Line Cook','Maintenance Technician','HR Generalist','Data Analyst','Sales Associate',
  'Physical Therapist','Insurance Adjuster','Machine Operator','Graphic Designer','Site Foreman'
];

export const SCHOOLS = [
  'Northfield High School','Westbrook High School','Central Valley High School','Lakeside High School',
  'Eastgate High School','Riverbend High School','Oakmont High School','Southridge High School'
];

export const COLLEGES = [
  'State University of the Midlands','Cedar Valley Community College','Harborview State College',
  'Pinecrest University','Northbridge Technical Institute','Lakeshore State University',
  'Summit College','Fairmount University','Overland Community College','Beacon Institute of Technology'
];

export const SOCIAL_NETS = [
  { net: 'Linkspace', pat: u => `linkspace.example/in/${u}` },
  { net: 'Chatterbox', pat: u => `chatterbox.example/@${u}` },
  { net: 'Snapgrid',  pat: u => `snapgrid.example/${u}` },
  { net: 'Foldr',     pat: u => `foldr.example/u/${u}` },
  { net: 'Vantage',   pat: u => `vantage.example/profile/${u}` }
];

export const CAR_MAKES = [
  ['Toyota',['Camry','Corolla','RAV4','Tacoma','Highlander']],
  ['Honda',['Civic','Accord','CR-V','Pilot','Odyssey']],
  ['Ford',['F-150','Escape','Explorer','Focus','Fusion']],
  ['Chevrolet',['Silverado','Malibu','Equinox','Impala','Tahoe']],
  ['Nissan',['Altima','Sentra','Rogue','Frontier','Maxima']],
  ['Subaru',['Outback','Forester','Impreza','Crosstrek']],
  ['Jeep',['Wrangler','Grand Cherokee','Cherokee','Compass']],
  ['Hyundai',['Elantra','Sonata','Tucson','Santa Fe']]
];

export const COLORS = ['Silver','White','Black','Blue','Red','Gray','Green','Beige','Burgundy'];

export const LICENSES = [
  'Cosmetology License','Real Estate Salesperson','Registered Nurse (RN)','Commercial Driver (CDL-A)',
  'Journeyman Electrician','Insurance Producer','Notary Public','Home Inspector',
  'Pesticide Applicator','Private Security Guard','Certified Public Accountant','Barber License'
];

export const COURT_TYPES = [
  'Small Claims — Civil','Traffic Infraction','Property Lien Filing','Civil Judgment',
  'Name Change Petition','Contract Dispute — Civil','Landlord/Tenant — Civil'
];

export const BIZ_SUFFIX = ['LLC','Inc','Co','Group','Partners','Services','Holdings'];

// Fictional data sources. A real people-search product joins feeds like these;
// naming them is how a report explains *why* it believes each field. Every
// source below is invented, as is every record attributed to it.
export const SOURCES = [
  { id: 'assessor', name: 'County Assessor Index',              kind: 'Property',   cadence: 'Quarterly',  reliability: 'High'   },
  { id: 'deed',     name: 'Deed & Title Filings',               kind: 'Property',   cadence: 'Monthly',    reliability: 'High'   },
  { id: 'coa',      name: 'Change-of-Address Extract',          kind: 'Address',    cadence: 'Monthly',    reliability: 'Medium' },
  { id: 'utility',  name: 'Utility Connection Records',         kind: 'Address',    cadence: 'Monthly',    reliability: 'Medium' },
  { id: 'voter',    name: 'Voter Registration Extract',         kind: 'Identity',   cadence: 'Annual',     reliability: 'High'   },
  { id: 'telecom',  name: 'Telecom Directory Feed',             kind: 'Contact',    cadence: 'Weekly',     reliability: 'Medium' },
  { id: 'panel',    name: 'Marketing Opt-in Panel',             kind: 'Contact',    cadence: 'Continuous', reliability: 'Low'    },
  { id: 'profnet',  name: 'Professional Network Profile',       kind: 'Employment', cadence: 'Continuous', reliability: 'Medium' },
  { id: 'bizreg',   name: 'Secretary of State Business Registry',kind: 'Business',  cadence: 'Monthly',    reliability: 'High'   },
  { id: 'licboard', name: 'State Licensing Board Roster',       kind: 'License',    cadence: 'Quarterly',  reliability: 'High'   },
  { id: 'dmv',      name: 'Vehicle Registration Extract',       kind: 'Asset',      cadence: 'Quarterly',  reliability: 'Medium' },
  { id: 'docket',   name: 'Court Docket Aggregator',            kind: 'Court',      cadence: 'Weekly',     reliability: 'Medium' },
  { id: 'alumni',   name: 'Alumni Directory Listing',           kind: 'Education',  cadence: 'Annual',     reliability: 'Low'    },
  { id: 'crawl',    name: 'Public Profile Crawler',             kind: 'Social',     cadence: 'Continuous', reliability: 'Low'    },
  { id: 'obit',     name: 'Newspaper & Obituary Archive',       kind: 'Relations',  cadence: 'Weekly',     reliability: 'Low'    },
  { id: 'hhold',    name: 'Household Composition File',         kind: 'Relations',  cadence: 'Quarterly',  reliability: 'Medium' }
];

export const SOURCE_BY_ID = Object.fromEntries(SOURCES.map(s => [s.id, s]));
