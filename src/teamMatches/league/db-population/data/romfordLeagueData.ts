interface TeamSetup {
  teamName: string;
  rank: number;
  playerNames: string[];
}
export interface ClubSetup {
  clubName: string;
  teamSetups: TeamSetup[];
}

// data retrieved manually from each team on the Romford website
export const clubSetups: ClubSetup[] = [
  {
    clubName: "Wellgate",
    teamSetups: [
      //div 3
      {
        teamName: "Wellgate",
        rank: 1,
        playerNames: [
          "Rob Gayler",
          "Ujitha De Zoysa",
          "Toby Gayler",
          "Roger Gayler",
          "Bruce Hay",
          "Andrew Home",
          "Andrew Petrou",
          "Sam Rank",
          "Richard Stringer",
          "Graeme Wilson",
          "Robert Youngs",
        ],
      },
    ],
  },
  {
    clubName: "Woodford Wells",
    teamSetups: [
      //div 1
      {
        teamName: "Woodford Wells",
        rank: 1,
        playerNames: [
          "Naveed Chaudhry",
          "Salahuddin (Sal) Ahmed", // *********************
          "Laikram Persaud",
          "Raphael Munkoh",
          "Hazem Abunaseer",
          "Daniel Howard",
          "Paul Bishop",
          "Michael Wood",
        ],
      },
    ],
  },
  {
    clubName: "Cranston Park",
    teamSetups: [
      //div 1
      {
        teamName: "Cranston Pk 1",
        rank: 1,
        playerNames: [
          "Richard Jackman",
          "David Jacob",
          "Simon Jacob",
          "Bruce Kettle",
          "Garry Lewsey",
          "Stuart Kimm",
          "Kevin Read",
        ],
      },
      {
        teamName: "Cranston Pk 2",
        rank: 2,
        playerNames: [
          "Martin Archie",
          "Terry Guymer",
          "James Hobley",
          "John Monk",
          "Reuben Okai",
          "Elaine Sayer",
          "Reece Seddon",
          "Jack Stockdale",
          "Gurjit Bhambra",
          "Mark Shade",
        ],
      },
      // div 3
      {
        teamName: "Cranston Pk 3",
        rank: 3,
        playerNames: [
          "George Ball",
          "Steven Barker",
          "Peter Cranmer",
          "Stephen Hall",
          "Michael Harris",
          "Richard Parlour",
          "Terry Timms",
          "Lee Wicks",
          "Tommy Hai",
        ],
      },
      {
        teamName: "Cranston Pk 4",
        rank: 4,
        playerNames: [
          "David Bowman",
          "Oscar Spencer",
          "Steve Brick",
          "Andrew Packer",
          "David Penrose",
          "Andrew Hilton",
          "Adam Jackman",
        ],
      },
      // div 4
      {
        teamName: "Cranston Pk 5",
        rank: 5,
        playerNames: [
          "Douglas Shewring",
          "Richard Lyne",
          "John Peck",
          "David Reed",
          "Simon Penrose",
        ],
      },
    ],
  },
  {
    clubName: "Trinity",
    teamSetups: [
      //div 2
      {
        teamName: "Trinity 1",
        rank: 1,
        playerNames: ["Dave Reynolds", "Peter Hilton", "Linda Roff"],
      },
      //div 3
      {
        teamName: "Trinity 2",
        rank: 2,
        playerNames: [
          "Clyde Marklew",
          "Alan Rosenfeld",
          "Gregory Gargrupe",
          "David Willson",
          "Antony Stonell",
          "Rodney Cadywould",
          "Ray Brown",
          "Robert Kemp",
          "John Crawford",
        ],
      },
    ],
  },
  {
    clubName: "Frenford",
    teamSetups: [
      //div 2
      {
        teamName: "Frenford 1",
        rank: 1,
        playerNames: [
          "Lee Marson",
          "Phillip Dos Santos",
          "Chinmai Aditya Baddepuram",
        ],
      },
      // div 3
      {
        teamName: "Frenford 2",
        rank: 2,
        playerNames: [
          "Radito Roxas",
          "Gary Pettifer",
          "M Uddin Zahir",
          "David Stanton",
          "Michael Morris",
          "Brian Yu",
          "Joel Prabhu",
        ],
      },
    ],
  },
  {
    clubName: "Mossford",
    teamSetups: [
      // div 2
      {
        teamName: "Mossford 3",
        rank: 3,
        playerNames: [
          "Feizal Mauthoor",
          "Oliver Pink",
          "Ronald Turner",
          "Numayr Malik",
          "Matthew Noble",
        ],
      },
      {
        teamName: "Mossford 4",
        rank: 4,
        playerNames: [
          "Romain Simon",
          "Scott Wigul",
          "Rhoda Boadu",
          "Asif Anwar",
          "Maxim Bogacic",
          "Michael Harris",
          "Rohit Sood",
        ],
      },
      //div 1
      {
        teamName: "Mossford 1",
        rank: 1,
        playerNames: [
          "Daniel Bronziet",
          "Jewels Uddin",
          "Prateek Bhalchandra Godse",
          "Valeriu Petcu-Cislaru",
          "Amit Agarwal",
          "Hamza Amode",
        ],
      },
      {
        teamName: "Mossford 2",
        rank: 2,
        playerNames: [
          "Hirdaipal Jaswal",
          "Denney Gabriel",
          "Stephen Spry",
          "Manveer Dhanjal",
          "Sunil Jindal",
          "Mario Ioakim",
        ],
      },
      // div 3
      {
        teamName: "Mossford 5",
        rank: 5,
        playerNames: [
          "Stanley Kenner",
          "Tony Cantale",
          "Simon Huggins",
          "Ben Williams",
        ],
      },
      // div 4
      {
        teamName: "Mossford 6",
        rank: 6,
        playerNames: [
          "Joshua Spry",
          "Alfie Ogunwole",
          "Christian Tishkin",
          "Mimololuwa Adu",
        ],
      },
    ],
  },
  {
    clubName: "Maylands Green",
    teamSetups: [
      // div 2
      {
        teamName: "Maylands Green 5",
        rank: 5,
        playerNames: [
          "Tony Hallett",
          "Duncan Brown",
          "Antonio Bonnici",
          "Simon Power",
          "Ben Agrawal",
          "Kamil Luczak",
          "Lucian Popescu",
        ],
      },
      {
        teamName: "Maylands Green 6",
        rank: 6,
        playerNames: [
          "Bolaji Kalejaiye",
          "Imad Katerji",
          "Bolaji Paul Ogunkoya",
        ],
      },
      {
        teamName: "Maylands Green 7",
        rank: 7,
        playerNames: [
          "Christopher Low",
          "Michael Rowe",
          "Roopesh Gookooluk",
          "Yilu Zhu",
        ],
      },
      {
        teamName: "Maylands Green 8",
        rank: 8,
        playerNames: [
          "Colin Beagle",
          "Ian Cranstone",
          "Paul Runham",
          "Russell Mills",
          "Albert Francis",
        ],
      },
      {
        teamName: "Maylands Green 9",
        rank: 9,
        playerNames: [
          "Adam Toumi",
          "Catalin Tamas",
          "Indrit Bajraktari",
          "Joe Lock",
          "Petru Maxian",
        ],
      },

      //div 1
      {
        teamName: "Maylands Green 1",
        rank: 1,
        playerNames: [
          "Cheung Ho Andrew Luk",
          "Evgeni Genchev",
          "Moses Olusoji",
          "Sandor Tuczkanyuk",
          "Damian Lesniewski",
        ],
      },
      {
        teamName: "Maylands Green 2",
        rank: 2,
        playerNames: ["Bradley Ireland", "Lee Noakes", "Jordan Allen"],
      },
      {
        teamName: "Maylands Green 3",
        rank: 3,
        playerNames: [
          "Bradley Osborne",
          "Christopher Penrose",
          "Kevin Mcnutt",
          "Shelley Uzal",
        ],
      },
      {
        teamName: "Maylands Green 4",
        rank: 4,
        playerNames: [
          "Christopher Herbert",
          "Emil Erkekov",
          "Martin Botley",
          "Neil Forbes",
          "Rick Klein",
        ],
      },
      // div 3
      {
        teamName: "Maylands Green 10",
        rank: 10,
        playerNames: [
          "Jonathan Hockley",
          "John Hockley",
          "Michael Sowah",
          "Paul Ilechie",
        ],
      },
      {
        teamName: "Maylands Green 11",
        rank: 11,
        playerNames: [
          "Chris Holiday",
          "Darryl Meyers",
          "Jonathan Velinor",
          "Paul Jones",
        ],
      },
      {
        teamName: "Maylands Green 12",
        rank: 12,
        playerNames: [
          "Clive Vandome",
          "Joan Donovan",
          "Luke Martin",
          "Sandra Alborough",
        ],
      },
      //div 4
      {
        teamName: "Maylands Green 13",
        rank: 13,
        playerNames: [
          "Keith Semaine",
          "Peter Trew",
          "Russell Cook",
          "Ugo Ahunanya",
        ],
      },
      {
        teamName: "Maylands Green 14",
        rank: 14,
        playerNames: [
          "Anis Toumi",
          "Devon Blackmore",
          "Naeem Shah",
          "Sorin Alupoaei",
        ],
      },
      {
        teamName: "Maylands Green 15",
        rank: 15,
        playerNames: [
          "Andrew Chin",
          "Raymond Lau",
          "Slawomir Alex Wilkowski",
          "Wilson Hunt",
        ],
      },
      {
        teamName: "Maylands Green 16",
        rank: 16,
        playerNames: [
          "Alan Cook",
          "Alphonso Peter Ruocco",
          "Martin Anness",
          "Sergei Bocharnikov",
        ],
      },
      {
        teamName: "Maylands Green 17",
        rank: 17,
        playerNames: [
          "Sandy Farma",
          "Daniel Moss",
          "Stephen Baldwin",
          "Man Ho Soo",
          "Kenneth Wong",
        ],
      },
      {
        teamName: "Maylands Green 18",
        rank: 18,
        playerNames: ["Ivan Georgiev", "Svetoslav Todorov", "Angel Hristov"],
      },
      {
        teamName: "Maylands Green 19",
        rank: 19,
        playerNames: [
          "John Hickey",
          "Rebecca Moore",
          "David Kirston",
          "Jackie Gregory",
          "Radvile Padelskaite",
        ],
      },
    ],
  },
];

// retrieved programmatically from https://romford.ttleagues.com/league/3139/fixtures?club&conditions&dateString&status&team&type=3&venue
/*

function getFixtureWeeks(){
  const fixtureWeeks = [...document.getElementsByClassName("fixture-week")];
  return fixtureWeeks.map(fixtureWeek => {
    const fixtureWeekDateElement = fixtureWeek.getElementsByClassName("mg-r-2")[0];
    if(fixtureWeekDateElement === undefined) return undefined;
    const fixtureWeekDate = fixtureWeekDateElement.innerText;
    const fixtures = [...fixtureWeek.getElementsByClassName("card fixture")].map(fixture => {
      const eventDateElement = fixture.getElementsByClassName("sp-event-date")[0];
      const eventDate = eventDateElement.innerText;
      const teamNames = fixture.getElementsByClassName("team-name");
      const homeTeam = teamNames[0].innerText;
      const awayTeam = teamNames[1].innerText;
      const noMatch = "NO MATCH";
      if(homeTeam === noMatch || awayTeam === noMatch){
        return undefined;
      }
      return {
        eventDate,
        homeTeam,
        awayTeam
      }
   }).filter(fixture => fixture !== undefined);
   if(fixtures.length === 0){
    return undefined;
   }
   return {
    date:fixtureWeekDate,
    fixtures
   }
  }).filter(fw => fw !== undefined);	
}
function logFixtureWeeks(){
  let log = "";
  const fixtureWeeks = getFixtureWeeks();
  fixtureWeeks.forEach(fixtureWeek => {
    log += `${JSON.stringify(fixtureWeek, undefined, 2)},`;
  });	
  console.log(log);	
}

logFixtureWeeks(); // copy and surround with []

*/
const fixtureWeeks = [
  {
    date: "23rd September",
    fixtures: [
      {
        eventDate: "Monday 23rd",
        homeTeam: "Cranston Pk 3",
        awayTeam: "Maylands G 10 (NRCC)",
      },
      {
        eventDate: "Tuesday 24th",
        homeTeam: "Maylands G 1",
        awayTeam: "Woodford Wells",
      },
      {
        eventDate: "Tuesday 24th",
        homeTeam: "Maylands G 6",
        awayTeam: "Maylands G 9 (NRCC)",
      },
      {
        eventDate: "Tuesday 24th",
        homeTeam: "Maylands G 13",
        awayTeam: "Maylands G 16",
      },
      {
        eventDate: "Tuesday 24th",
        homeTeam: "Frenford 1",
        awayTeam: "Maylands G 8",
      },
      {
        eventDate: "Wednesday 25th",
        homeTeam: "Maylands G 2 (NRCC)",
        awayTeam: "Mossford 2",
      },
      {
        eventDate: "Wednesday 25th",
        homeTeam: "Mossford 3",
        awayTeam: "Maylands G 7 (NRCC)",
      },
      {
        eventDate: "Wednesday 25th",
        homeTeam: "Maylands G 5 (NRCC)",
        awayTeam: "Mossford 4",
      },
      {
        eventDate: "Wednesday 25th",
        homeTeam: "Cranston Pk 4",
        awayTeam: "Mossford 5",
      },
      {
        eventDate: "Thursday 26th",
        homeTeam: "Maylands G 3",
        awayTeam: "Cranston Pk 2",
      },
      {
        eventDate: "Thursday 26th",
        homeTeam: "Maylands G 11",
        awayTeam: "Frenford 2",
      },
      {
        eventDate: "Thursday 26th",
        homeTeam: "Mossford 6",
        awayTeam: "Maylands G 17",
      },
      {
        eventDate: "Thursday 26th",
        homeTeam: "Maylands G 14",
        awayTeam: "Maylands G 15",
      },
      {
        eventDate: "Thursday 26th",
        homeTeam: "Cranston Pk 1",
        awayTeam: "Maylands G 4",
      },
      {
        eventDate: "Friday 27th",
        homeTeam: "Maylands G 19 (CR)",
        awayTeam: "Cranston Pk 5",
      },
      {
        eventDate: "Friday 27th",
        homeTeam: "Wellgate (Abridge)",
        awayTeam: "Trinity 2",
      },
    ],
  },
  {
    date: "30th September",
    fixtures: [
      {
        eventDate: "Monday 30th",
        homeTeam: "Woodford Wells",
        awayTeam: "Mossford 1",
      },
      {
        eventDate: "Tuesday 1st",
        homeTeam: "Maylands G 8",
        awayTeam: "Maylands G 5 (NRCC)",
      },
      {
        eventDate: "Tuesday 1st",
        homeTeam: "Maylands G 15",
        awayTeam: "Maylands G 13",
      },
      {
        eventDate: "Wednesday 2nd",
        homeTeam: "Mossford 2",
        awayTeam: "Maylands G 1",
      },
      {
        eventDate: "Wednesday 2nd",
        homeTeam: "Maylands G 7 (NRCC)",
        awayTeam: "Maylands G 6",
      },
      {
        eventDate: "Wednesday 2nd",
        homeTeam: "Mossford 4",
        awayTeam: "Trinity 1",
      },
      {
        eventDate: "Wednesday 2nd",
        homeTeam: "Maylands G 9 (NRCC)",
        awayTeam: "Frenford 1",
      },
      {
        eventDate: "Wednesday 2nd",
        homeTeam: "Mossford 5",
        awayTeam: "Wellgate (Abridge)",
      },
      {
        eventDate: "Wednesday 2nd",
        homeTeam: "Maylands G 10 (NRCC)",
        awayTeam: "Maylands G 11",
      },
      {
        eventDate: "Thursday 3rd",
        homeTeam: "Maylands G 4",
        awayTeam: "Maylands G 2 (NRCC)",
      },
      {
        eventDate: "Thursday 3rd",
        homeTeam: "Maylands G 12",
        awayTeam: "Cranston Pk 4",
      },
      {
        eventDate: "Thursday 3rd",
        homeTeam: "Maylands G 17",
        awayTeam: "Cranston Pk 5",
      },
      {
        eventDate: "Thursday 3rd",
        homeTeam: "Mossford 6",
        awayTeam: "Maylands G 16",
      },
      {
        eventDate: "Thursday 3rd",
        homeTeam: "Cranston Pk 2",
        awayTeam: "Cranston Pk 1",
      },
      {
        eventDate: "Thursday 3rd",
        homeTeam: "Trinity 2",
        awayTeam: "Cranston Pk 3",
      },
      {
        eventDate: "Friday 4th",
        homeTeam: "Maylands G 19 (CR)",
        awayTeam: "Maylands G 18 (NRCC)",
      },
    ],
  },
  {
    date: "7th October",
    fixtures: [
      {
        eventDate: "Monday 7th",
        homeTeam: "Cranston Pk 3",
        awayTeam: "Mossford 5",
      },
      {
        eventDate: "Tuesday 8th",
        homeTeam: "Maylands G 1",
        awayTeam: "Maylands G 4",
      },
      {
        eventDate: "Tuesday 8th",
        homeTeam: "Frenford 2",
        awayTeam: "Maylands G 10 (NRCC)",
      },
      {
        eventDate: "Tuesday 8th",
        homeTeam: "Cranston Pk 5",
        awayTeam: "Maylands G 16",
      },
      {
        eventDate: "Wednesday 9th",
        homeTeam: "Mossford 1",
        awayTeam: "Mossford 2",
      },
      {
        eventDate: "Wednesday 9th",
        homeTeam: "Maylands G 2 (NRCC)",
        awayTeam: "Cranston Pk 1",
      },
      {
        eventDate: "Wednesday 9th",
        homeTeam: "Mossford 3",
        awayTeam: "Mossford 4",
      },
      {
        eventDate: "Wednesday 9th",
        homeTeam: "Maylands G 5 (NRCC)",
        awayTeam: "Frenford 1",
      },
      {
        eventDate: "Wednesday 9th",
        homeTeam: "Maylands G 9 (NRCC)",
        awayTeam: "Maylands G 7 (NRCC)",
      },
      {
        eventDate: "Thursday 10th",
        homeTeam: "Maylands G 3",
        awayTeam: "Woodford Wells",
      },
      {
        eventDate: "Thursday 10th",
        homeTeam: "Maylands G 11",
        awayTeam: "Trinity 2",
      },
      {
        eventDate: "Thursday 10th",
        homeTeam: "Mossford 6",
        awayTeam: "Maylands G 15",
      },
      {
        eventDate: "Thursday 10th",
        homeTeam: "Maylands G 14",
        awayTeam: "Maylands G 18 (NRCC)",
      },
      {
        eventDate: "Thursday 10th",
        homeTeam: "Trinity 1",
        awayTeam: "Maylands G 8",
      },
      {
        eventDate: "Friday 11th",
        homeTeam: "Maylands G 19 (CR)",
        awayTeam: "Maylands G 17",
      },
      {
        eventDate: "Friday 11th",
        homeTeam: "Wellgate (Abridge)",
        awayTeam: "Maylands G 12",
      },
    ],
  },
  {
    date: "14th October",
    fixtures: [
      {
        eventDate: "Tuesday 15th",
        homeTeam: "Maylands G 8",
        awayTeam: "Mossford 3",
      },
      {
        eventDate: "Tuesday 15th",
        homeTeam: "Maylands G 15",
        awayTeam: "Cranston Pk 5",
      },
      {
        eventDate: "Tuesday 15th",
        homeTeam: "Maylands G 16",
        awayTeam: "Maylands G 17",
      },
      {
        eventDate: "Tuesday 15th",
        homeTeam: "Frenford 1",
        awayTeam: "Trinity 1",
      },
      {
        eventDate: "Wednesday 16th",
        homeTeam: "Mossford 2",
        awayTeam: "Maylands G 3",
      },
      {
        eventDate: "Wednesday 16th",
        homeTeam: "Maylands G 2 (NRCC)",
        awayTeam: "Cranston Pk 2",
      },
      {
        eventDate: "Wednesday 16th",
        homeTeam: "Mossford 4",
        awayTeam: "Maylands G 6",
      },
      {
        eventDate: "Wednesday 16th",
        homeTeam: "Maylands G 5 (NRCC)",
        awayTeam: "Maylands G 9 (NRCC)",
      },
      {
        eventDate: "Wednesday 16th",
        homeTeam: "Mossford 5",
        awayTeam: "Maylands G 11",
      },
      {
        eventDate: "Wednesday 16th",
        homeTeam: "Cranston Pk 4",
        awayTeam: "Frenford 2",
      },
      {
        eventDate: "Wednesday 16th",
        homeTeam: "Maylands G 18 (NRCC)",
        awayTeam: "Maylands G 13",
      },
      {
        eventDate: "Thursday 17th",
        homeTeam: "Maylands G 4",
        awayTeam: "Mossford 1",
      },
      {
        eventDate: "Thursday 17th",
        homeTeam: "Maylands G 12",
        awayTeam: "Cranston Pk 3",
      },
      {
        eventDate: "Thursday 17th",
        homeTeam: "Cranston Pk 1",
        awayTeam: "Maylands G 1",
      },
      {
        eventDate: "Thursday 17th",
        homeTeam: "Trinity 2",
        awayTeam: "Maylands G 10 (NRCC)",
      },
      {
        eventDate: "Friday 18th",
        homeTeam: "Maylands G 19 (CR)",
        awayTeam: "Maylands G 14",
      },
    ],
  },
  {
    date: "21st October",
    fixtures: [
      {
        eventDate: "Tuesday 22nd",
        homeTeam: "Maylands G 1",
        awayTeam: "Maylands G 2 (NRCC)",
      },
      {
        eventDate: "Tuesday 22nd",
        homeTeam: "Maylands G 6",
        awayTeam: "Maylands G 8",
      },
      {
        eventDate: "Tuesday 22nd",
        homeTeam: "Maylands G 13",
        awayTeam: "Maylands G 14",
      },
      {
        eventDate: "Tuesday 22nd",
        homeTeam: "Frenford 2",
        awayTeam: "Trinity 2",
      },
      {
        eventDate: "Wednesday 23rd",
        homeTeam: "Mossford 1",
        awayTeam: "Cranston Pk 1",
      },
      {
        eventDate: "Wednesday 23rd",
        homeTeam: "Mossford 3",
        awayTeam: "Frenford 1",
      },
      {
        eventDate: "Wednesday 23rd",
        homeTeam: "Maylands G 7 (NRCC)",
        awayTeam: "Mossford 4",
      },
      {
        eventDate: "Wednesday 23rd",
        homeTeam: "Maylands G 10 (NRCC)",
        awayTeam: "Mossford 5",
      },
      {
        eventDate: "Thursday 24th",
        homeTeam: "Maylands G 3",
        awayTeam: "Maylands G 4",
      },
      {
        eventDate: "Thursday 24th",
        homeTeam: "Maylands G 11",
        awayTeam: "Maylands G 12",
      },
      {
        eventDate: "Thursday 24th",
        homeTeam: "Mossford 6",
        awayTeam: "Maylands G 18 (NRCC)",
      },
      {
        eventDate: "Thursday 24th",
        homeTeam: "Maylands G 17",
        awayTeam: "Maylands G 15",
      },
      {
        eventDate: "Thursday 24th",
        homeTeam: "Cranston Pk 2",
        awayTeam: "Woodford Wells",
      },
      {
        eventDate: "Thursday 24th",
        homeTeam: "Trinity 1",
        awayTeam: "Maylands G 5 (NRCC)",
      },
      {
        eventDate: "Friday 25th",
        homeTeam: "Maylands G 19 (CR)",
        awayTeam: "Maylands G 16",
      },
      {
        eventDate: "Friday 25th",
        homeTeam: "Wellgate (Abridge)",
        awayTeam: "Cranston Pk 4",
      },
    ],
  },
  {
    date: "28th October",
    fixtures: [
      {
        eventDate: "Tuesday 29th",
        homeTeam: "Maylands G 8",
        awayTeam: "Maylands G 7 (NRCC)",
      },
      {
        eventDate: "Tuesday 29th",
        homeTeam: "Maylands G 15",
        awayTeam: "Maylands G 16",
      },
      {
        eventDate: "Tuesday 29th",
        homeTeam: "Cranston Pk 2",
        awayTeam: "Maylands G 1",
      },
      {
        eventDate: "Tuesday 29th",
        homeTeam: "Frenford 1",
        awayTeam: "Maylands G 6",
      },
      {
        eventDate: "Wednesday 30th",
        homeTeam: "Maylands G 2 (NRCC)",
        awayTeam: "Mossford 1",
      },
      {
        eventDate: "Wednesday 30th",
        homeTeam: "Mossford 2",
        awayTeam: "Woodford Wells",
      },
      {
        eventDate: "Wednesday 30th",
        homeTeam: "Maylands G 5 (NRCC)",
        awayTeam: "Mossford 3",
      },
      {
        eventDate: "Wednesday 30th",
        homeTeam: "Mossford 5",
        awayTeam: "Trinity 2",
      },
      {
        eventDate: "Wednesday 30th",
        homeTeam: "Cranston Pk 4",
        awayTeam: "Cranston Pk 3",
      },
      {
        eventDate: "Wednesday 30th",
        homeTeam: "Maylands G 18 (NRCC)",
        awayTeam: "Cranston Pk 5",
      },
      {
        eventDate: "Thursday 31st",
        homeTeam: "Cranston Pk 1",
        awayTeam: "Maylands G 3",
      },
      {
        eventDate: "Thursday 31st",
        homeTeam: "Maylands G 12",
        awayTeam: "Maylands G 10 (NRCC)",
      },
      {
        eventDate: "Thursday 31st",
        homeTeam: "Mossford 6",
        awayTeam: "Maylands G 14",
      },
      {
        eventDate: "Thursday 31st",
        homeTeam: "Trinity 1",
        awayTeam: "Maylands G 9 (NRCC)",
      },
      {
        eventDate: "Friday 1st",
        homeTeam: "Maylands G 19 (CR)",
        awayTeam: "Maylands G 13",
      },
      {
        eventDate: "Friday 1st",
        homeTeam: "Wellgate (Abridge)",
        awayTeam: "Frenford 2",
      },
    ],
  },
  {
    date: "4th November",
    fixtures: [
      {
        eventDate: "Monday 4th",
        homeTeam: "Woodford Wells",
        awayTeam: "Maylands G 4",
      },
      {
        eventDate: "Monday 4th",
        homeTeam: "Cranston Pk 3",
        awayTeam: "Wellgate (Abridge)",
      },
      {
        eventDate: "Tuesday 5th",
        homeTeam: "Maylands G 6",
        awayTeam: "Maylands G 5 (NRCC)",
      },
      {
        eventDate: "Tuesday 5th",
        homeTeam: "Frenford 2",
        awayTeam: "Mossford 5",
      },
      {
        eventDate: "Tuesday 5th",
        homeTeam: "Cranston Pk 5",
        awayTeam: "Maylands G 14",
      },
      {
        eventDate: "Wednesday 6th",
        homeTeam: "Mossford 1",
        awayTeam: "Maylands G 1",
      },
      {
        eventDate: "Wednesday 6th",
        homeTeam: "Mossford 3",
        awayTeam: "Trinity 1",
      },
      {
        eventDate: "Wednesday 6th",
        homeTeam: "Maylands G 7 (NRCC)",
        awayTeam: "Frenford 1",
      },
      {
        eventDate: "Wednesday 6th",
        homeTeam: "Maylands G 9 (NRCC)",
        awayTeam: "Mossford 4",
      },
      {
        eventDate: "Thursday 7th",
        homeTeam: "Maylands G 3",
        awayTeam: "Maylands G 2 (NRCC)",
      },
      {
        eventDate: "Thursday 7th",
        homeTeam: "Cranston Pk 2",
        awayTeam: "Mossford 2",
      },
      {
        eventDate: "Thursday 7th",
        homeTeam: "Maylands G 11",
        awayTeam: "Cranston Pk 4",
      },
      {
        eventDate: "Thursday 7th",
        homeTeam: "Mossford 6",
        awayTeam: "Maylands G 13",
      },
      {
        eventDate: "Thursday 7th",
        homeTeam: "Maylands G 17",
        awayTeam: "Maylands G 18 (NRCC)",
      },
      {
        eventDate: "Thursday 7th",
        homeTeam: "Trinity 2",
        awayTeam: "Maylands G 12",
      },
      {
        eventDate: "Friday 8th",
        homeTeam: "Maylands G 19 (CR)",
        awayTeam: "Maylands G 15",
      },
    ],
  },
  {
    date: "18th November",
    fixtures: [
      {
        eventDate: "Monday 18th",
        homeTeam: "Cranston Pk 3",
        awayTeam: "Frenford 2",
      },
      {
        eventDate: "Tuesday 19th",
        homeTeam: "Maylands G 1",
        awayTeam: "Maylands G 3",
      },
      {
        eventDate: "Tuesday 19th",
        homeTeam: "Maylands G 8",
        awayTeam: "Mossford 4",
      },
      {
        eventDate: "Tuesday 19th",
        homeTeam: "Maylands G 13",
        awayTeam: "Cranston Pk 5",
      },
      {
        eventDate: "Wednesday 20th",
        homeTeam: "Mossford 1",
        awayTeam: "Cranston Pk 2",
      },
      {
        eventDate: "Wednesday 20th",
        homeTeam: "Mossford 3",
        awayTeam: "Maylands G 9 (NRCC)",
      },
      {
        eventDate: "Wednesday 20th",
        homeTeam: "Maylands G 5 (NRCC)",
        awayTeam: "Maylands G 7 (NRCC)",
      },
      {
        eventDate: "Wednesday 20th",
        homeTeam: "Cranston Pk 4",
        awayTeam: "Maylands G 10 (NRCC)",
      },
      {
        eventDate: "Wednesday 20th",
        homeTeam: "Maylands G 18 (NRCC)",
        awayTeam: "Maylands G 16",
      },
      {
        eventDate: "Thursday 21st",
        homeTeam: "Maylands G 4",
        awayTeam: "Mossford 2",
      },
      {
        eventDate: "Thursday 21st",
        homeTeam: "Maylands G 12",
        awayTeam: "Mossford 5",
      },
      {
        eventDate: "Thursday 21st",
        homeTeam: "Maylands G 14",
        awayTeam: "Maylands G 17",
      },
      {
        eventDate: "Thursday 21st",
        homeTeam: "Cranston Pk 1",
        awayTeam: "Woodford Wells",
      },
      {
        eventDate: "Thursday 21st",
        homeTeam: "Trinity 1",
        awayTeam: "Maylands G 6",
      },
      {
        eventDate: "Friday 22nd",
        homeTeam: "Maylands G 19 (CR)",
        awayTeam: "Mossford 6",
      },
      {
        eventDate: "Friday 22nd",
        homeTeam: "Wellgate (Abridge)",
        awayTeam: "Maylands G 11",
      },
    ],
  },
  {
    date: "25th November",
    fixtures: [
      {
        eventDate: "Monday 25th",
        homeTeam: "Woodford Wells",
        awayTeam: "Maylands G 2 (NRCC)",
      },
      {
        eventDate: "Tuesday 26th",
        homeTeam: "Maylands G 6",
        awayTeam: "Mossford 3",
      },
      {
        eventDate: "Tuesday 26th",
        homeTeam: "Maylands G 16",
        awayTeam: "Maylands G 14",
      },
      {
        eventDate: "Tuesday 26th",
        homeTeam: "Maylands G 15",
        awayTeam: "Maylands G 18 (NRCC)",
      },
      {
        eventDate: "Tuesday 26th",
        homeTeam: "Frenford 2",
        awayTeam: "Maylands G 12",
      },
      {
        eventDate: "Wednesday 27th",
        homeTeam: "Mossford 2",
        awayTeam: "Cranston Pk 1",
      },
      {
        eventDate: "Wednesday 27th",
        homeTeam: "Maylands G 7 (NRCC)",
        awayTeam: "Trinity 1",
      },
      {
        eventDate: "Wednesday 27th",
        homeTeam: "Mossford 4",
        awayTeam: "Frenford 1",
      },
      {
        eventDate: "Wednesday 27th",
        homeTeam: "Maylands G 9 (NRCC)",
        awayTeam: "Maylands G 8",
      },
      {
        eventDate: "Wednesday 27th",
        homeTeam: "Maylands G 10 (NRCC)",
        awayTeam: "Wellgate (Abridge)",
      },
      {
        eventDate: "Thursday 28th",
        homeTeam: "Maylands G 3",
        awayTeam: "Mossford 1",
      },
      {
        eventDate: "Thursday 28th",
        homeTeam: "Maylands G 11",
        awayTeam: "Cranston Pk 3",
      },
      {
        eventDate: "Thursday 28th",
        homeTeam: "Mossford 6",
        awayTeam: "Cranston Pk 5",
      },
      {
        eventDate: "Thursday 28th",
        homeTeam: "Maylands G 17",
        awayTeam: "Maylands G 13",
      },
      {
        eventDate: "Thursday 28th",
        homeTeam: "Cranston Pk 2",
        awayTeam: "Maylands G 4",
      },
      {
        eventDate: "Thursday 28th",
        homeTeam: "Trinity 2",
        awayTeam: "Cranston Pk 4",
      },
    ],
  },
  {
    date: "27th January",
    fixtures: [
      {
        eventDate: "Monday 27th",
        homeTeam: "Woodford Wells",
        awayTeam: "Maylands G 1",
      },
      {
        eventDate: "Tuesday 28th",
        homeTeam: "Maylands G 8",
        awayTeam: "Frenford 1",
      },
      {
        eventDate: "Tuesday 28th",
        homeTeam: "Maylands G 16",
        awayTeam: "Maylands G 13",
      },
      {
        eventDate: "Tuesday 28th",
        homeTeam: "Maylands G 15",
        awayTeam: "Maylands G 14",
      },
      {
        eventDate: "Tuesday 28th",
        homeTeam: "Frenford 2",
        awayTeam: "Maylands G 11",
      },
      {
        eventDate: "Wednesday 29th",
        homeTeam: "Mossford 2",
        awayTeam: "Maylands G 2 (NRCC)",
      },
      {
        eventDate: "Wednesday 29th",
        homeTeam: "Maylands G 9 (NRCC)",
        awayTeam: "Maylands G 6",
      },
      {
        eventDate: "Wednesday 29th",
        homeTeam: "Maylands G 7 (NRCC)",
        awayTeam: "Mossford 3",
      },
      {
        eventDate: "Wednesday 29th",
        homeTeam: "Mossford 4",
        awayTeam: "Maylands G 5 (NRCC)",
      },
      {
        eventDate: "Wednesday 29th",
        homeTeam: "Mossford 5",
        awayTeam: "Cranston Pk 4",
      },
      {
        eventDate: "Wednesday 29th",
        homeTeam: "Maylands G 10 (NRCC)",
        awayTeam: "Cranston Pk 3",
      },
      {
        eventDate: "Thursday 30th",
        homeTeam: "Maylands G 4",
        awayTeam: "Cranston Pk 1",
      },
      {
        eventDate: "Thursday 30th",
        homeTeam: "Mossford 6",
        awayTeam: "Maylands G 17",
      },
      {
        eventDate: "Thursday 30th",
        homeTeam: "Cranston Pk 2",
        awayTeam: "Maylands G 3",
      },
      {
        eventDate: "Thursday 30th",
        homeTeam: "Trinity 2",
        awayTeam: "Wellgate (Abridge)",
      },
      {
        eventDate: "Friday 31st",
        homeTeam: "Maylands G 19 (CR)",
        awayTeam: "Cranston Pk 5",
      },
    ],
  },
  {
    date: "3rd February",
    fixtures: [
      {
        eventDate: "Monday 3rd",
        homeTeam: "Cranston Pk 3",
        awayTeam: "Trinity 2",
      },
      {
        eventDate: "Tuesday 4th",
        homeTeam: "Maylands G 1",
        awayTeam: "Mossford 2",
      },
      {
        eventDate: "Tuesday 4th",
        homeTeam: "Maylands G 6",
        awayTeam: "Maylands G 7 (NRCC)",
      },
      {
        eventDate: "Tuesday 4th",
        homeTeam: "Maylands G 13",
        awayTeam: "Maylands G 15",
      },
      {
        eventDate: "Tuesday 4th",
        homeTeam: "Frenford 1",
        awayTeam: "Maylands G 9 (NRCC)",
      },
      {
        eventDate: "Tuesday 4th",
        homeTeam: "Cranston Pk 5",
        awayTeam: "Maylands G 17",
      },
      {
        eventDate: "Wednesday 5th",
        homeTeam: "Mossford 1",
        awayTeam: "Woodford Wells",
      },
      {
        eventDate: "Wednesday 5th",
        homeTeam: "Maylands G 2 (NRCC)",
        awayTeam: "Maylands G 4",
      },
      {
        eventDate: "Wednesday 5th",
        homeTeam: "Maylands G 5 (NRCC)",
        awayTeam: "Maylands G 8",
      },
      {
        eventDate: "Wednesday 5th",
        homeTeam: "Cranston Pk 4",
        awayTeam: "Maylands G 12",
      },
      {
        eventDate: "Thursday 6th",
        homeTeam: "Maylands G 11",
        awayTeam: "Maylands G 10 (NRCC)",
      },
      {
        eventDate: "Thursday 6th",
        homeTeam: "Mossford 6",
        awayTeam: "Maylands G 16",
      },
      {
        eventDate: "Thursday 6th",
        homeTeam: "Cranston Pk 1",
        awayTeam: "Cranston Pk 2",
      },
      {
        eventDate: "Thursday 6th",
        homeTeam: "Trinity 1",
        awayTeam: "Mossford 4",
      },
      {
        eventDate: "Friday 7th",
        homeTeam: "Maylands G 19 (CR)",
        awayTeam: "Maylands G 18 (NRCC)",
      },
      {
        eventDate: "Friday 7th",
        homeTeam: "Wellgate (Abridge)",
        awayTeam: "Mossford 5",
      },
    ],
  },
  {
    date: "17th February",
    fixtures: [
      {
        eventDate: "Monday 17th",
        homeTeam: "Woodford Wells",
        awayTeam: "Maylands G 3",
      },
      {
        eventDate: "Tuesday 18th",
        homeTeam: "Maylands G 8",
        awayTeam: "Trinity 1",
      },
      {
        eventDate: "Tuesday 18th",
        homeTeam: "Maylands G 16",
        awayTeam: "Cranston Pk 5",
      },
      {
        eventDate: "Tuesday 18th",
        homeTeam: "Frenford 1",
        awayTeam: "Maylands G 5 (NRCC)",
      },
      {
        eventDate: "Wednesday 19th",
        homeTeam: "Mossford 2",
        awayTeam: "Mossford 1",
      },
      {
        eventDate: "Wednesday 19th",
        homeTeam: "Mossford 4",
        awayTeam: "Mossford 3",
      },
      {
        eventDate: "Wednesday 19th",
        homeTeam: "Maylands G 7 (NRCC)",
        awayTeam: "Maylands G 9 (NRCC)",
      },
      {
        eventDate: "Wednesday 19th",
        homeTeam: "Mossford 5",
        awayTeam: "Cranston Pk 3",
      },
      {
        eventDate: "Wednesday 19th",
        homeTeam: "Maylands G 10 (NRCC)",
        awayTeam: "Frenford 2",
      },
      {
        eventDate: "Wednesday 19th",
        homeTeam: "Maylands G 18 (NRCC)",
        awayTeam: "Maylands G 14",
      },
      {
        eventDate: "Thursday 20th",
        homeTeam: "Maylands G 4",
        awayTeam: "Maylands G 1",
      },
      {
        eventDate: "Thursday 20th",
        homeTeam: "Maylands G 12",
        awayTeam: "Wellgate (Abridge)",
      },
      {
        eventDate: "Thursday 20th",
        homeTeam: "Mossford 6",
        awayTeam: "Maylands G 15",
      },
      {
        eventDate: "Thursday 20th",
        homeTeam: "Cranston Pk 1",
        awayTeam: "Maylands G 2 (NRCC)",
      },
      {
        eventDate: "Thursday 20th",
        homeTeam: "Trinity 2",
        awayTeam: "Maylands G 11",
      },
      {
        eventDate: "Friday 21st",
        homeTeam: "Maylands G 19 (CR)",
        awayTeam: "Maylands G 17",
      },
    ],
  },
  {
    date: "24th February",
    fixtures: [
      {
        eventDate: "Monday 24th",
        homeTeam: "Cranston Pk 3",
        awayTeam: "Maylands G 12",
      },
      {
        eventDate: "Tuesday 25th",
        homeTeam: "Maylands G 1",
        awayTeam: "Cranston Pk 1",
      },
      {
        eventDate: "Tuesday 25th",
        homeTeam: "Maylands G 6",
        awayTeam: "Mossford 4",
      },
      {
        eventDate: "Tuesday 25th",
        homeTeam: "Maylands G 13",
        awayTeam: "Maylands G 18 (NRCC)",
      },
      {
        eventDate: "Tuesday 25th",
        homeTeam: "Frenford 2",
        awayTeam: "Cranston Pk 4",
      },
      {
        eventDate: "Tuesday 25th",
        homeTeam: "Cranston Pk 5",
        awayTeam: "Maylands G 15",
      },
      {
        eventDate: "Wednesday 26th",
        homeTeam: "Mossford 1",
        awayTeam: "Maylands G 4",
      },
      {
        eventDate: "Wednesday 26th",
        homeTeam: "Mossford 3",
        awayTeam: "Maylands G 8",
      },
      {
        eventDate: "Wednesday 26th",
        homeTeam: "Maylands G 9 (NRCC)",
        awayTeam: "Maylands G 5 (NRCC)",
      },
      {
        eventDate: "Wednesday 26th",
        homeTeam: "Maylands G 10 (NRCC)",
        awayTeam: "Trinity 2",
      },
      {
        eventDate: "Thursday 27th",
        homeTeam: "Maylands G 3",
        awayTeam: "Mossford 2",
      },
      {
        eventDate: "Thursday 27th",
        homeTeam: "Maylands G 11",
        awayTeam: "Mossford 5",
      },
      {
        eventDate: "Thursday 27th",
        homeTeam: "Maylands G 17",
        awayTeam: "Maylands G 16",
      },
      {
        eventDate: "Thursday 27th",
        homeTeam: "Cranston Pk 2",
        awayTeam: "Maylands G 2 (NRCC)",
      },
      {
        eventDate: "Thursday 27th",
        homeTeam: "Trinity 1",
        awayTeam: "Frenford 1",
      },
      {
        eventDate: "Friday 28th",
        homeTeam: "Maylands G 19 (CR)",
        awayTeam: "Maylands G 14",
      },
    ],
  },
  {
    date: "3rd March",
    fixtures: [
      {
        eventDate: "Monday 3rd",
        homeTeam: "Woodford Wells",
        awayTeam: "Cranston Pk 2",
      },
      {
        eventDate: "Tuesday 4th",
        homeTeam: "Maylands G 8",
        awayTeam: "Maylands G 6",
      },
      {
        eventDate: "Tuesday 4th",
        homeTeam: "Maylands G 15",
        awayTeam: "Maylands G 17",
      },
      {
        eventDate: "Tuesday 4th",
        homeTeam: "Frenford 1",
        awayTeam: "Mossford 3",
      },
      {
        eventDate: "Wednesday 5th",
        homeTeam: "Maylands G 2 (NRCC)",
        awayTeam: "Maylands G 1",
      },
      {
        eventDate: "Wednesday 5th",
        homeTeam: "Maylands G 5 (NRCC)",
        awayTeam: "Trinity 1",
      },
      {
        eventDate: "Wednesday 5th",
        homeTeam: "Mossford 4",
        awayTeam: "Maylands G 7 (NRCC)",
      },
      {
        eventDate: "Wednesday 5th",
        homeTeam: "Mossford 5",
        awayTeam: "Maylands G 10 (NRCC)",
      },
      {
        eventDate: "Wednesday 5th",
        homeTeam: "Cranston Pk 4",
        awayTeam: "Wellgate (Abridge)",
      },
      {
        eventDate: "Thursday 6th",
        homeTeam: "Maylands G 4",
        awayTeam: "Maylands G 3",
      },
      {
        eventDate: "Thursday 6th",
        homeTeam: "Maylands G 12",
        awayTeam: "Maylands G 11",
      },
      {
        eventDate: "Thursday 6th",
        homeTeam: "Mossford 6",
        awayTeam: "Maylands G 18 (NRCC)",
      },
      {
        eventDate: "Thursday 6th",
        homeTeam: "Maylands G 14",
        awayTeam: "Maylands G 13",
      },
      {
        eventDate: "Thursday 6th",
        homeTeam: "Cranston Pk 1",
        awayTeam: "Mossford 1",
      },
      {
        eventDate: "Thursday 6th",
        homeTeam: "Trinity 2",
        awayTeam: "Frenford 2",
      },
      {
        eventDate: "Friday 7th",
        homeTeam: "Maylands G 19 (CR)",
        awayTeam: "Maylands G 16",
      },
    ],
  },
  {
    date: "17th March",
    fixtures: [
      {
        eventDate: "Monday 17th",
        homeTeam: "Woodford Wells",
        awayTeam: "Mossford 2",
      },
      {
        eventDate: "Monday 17th",
        homeTeam: "Cranston Pk 3",
        awayTeam: "Cranston Pk 4",
      },
      {
        eventDate: "Tuesday 18th",
        homeTeam: "Maylands G 6",
        awayTeam: "Frenford 1",
      },
      {
        eventDate: "Tuesday 18th",
        homeTeam: "Maylands G 16",
        awayTeam: "Maylands G 15",
      },
      {
        eventDate: "Tuesday 18th",
        homeTeam: "Frenford 2",
        awayTeam: "Wellgate (Abridge)",
      },
      {
        eventDate: "Tuesday 18th",
        homeTeam: "Cranston Pk 5",
        awayTeam: "Maylands G 18 (NRCC)",
      },
      {
        eventDate: "Tuesday 18th",
        homeTeam: "Maylands G 1",
        awayTeam: "Cranston Pk 2",
      },
      {
        eventDate: "Wednesday 19th",
        homeTeam: "Mossford 1",
        awayTeam: "Maylands G 2 (NRCC)",
      },
      {
        eventDate: "Wednesday 19th",
        homeTeam: "Mossford 3",
        awayTeam: "Maylands G 5 (NRCC)",
      },
      {
        eventDate: "Wednesday 19th",
        homeTeam: "Maylands G 9 (NRCC)",
        awayTeam: "Trinity 1",
      },
      {
        eventDate: "Wednesday 19th",
        homeTeam: "Maylands G 7 (NRCC)",
        awayTeam: "Maylands G 8",
      },
      {
        eventDate: "Wednesday 19th",
        homeTeam: "Maylands G 10 (NRCC)",
        awayTeam: "Maylands G 12",
      },
      {
        eventDate: "Thursday 20th",
        homeTeam: "Maylands G 3",
        awayTeam: "Cranston Pk 1",
      },
      {
        eventDate: "Thursday 20th",
        homeTeam: "Mossford 6",
        awayTeam: "Maylands G 14",
      },
      {
        eventDate: "Thursday 20th",
        homeTeam: "Trinity 2",
        awayTeam: "Mossford 5",
      },
      {
        eventDate: "Friday 21st",
        homeTeam: "Maylands G 19 (CR)",
        awayTeam: "Maylands G 13",
      },
    ],
  },
  {
    date: "24th March",
    fixtures: [
      {
        eventDate: "Tuesday 25th",
        homeTeam: "Maylands G 1",
        awayTeam: "Mossford 1",
      },
      {
        eventDate: "Tuesday 25th",
        homeTeam: "Frenford 1",
        awayTeam: "Maylands G 7 (NRCC)",
      },
      {
        eventDate: "Wednesday 26th",
        homeTeam: "Maylands G 2 (NRCC)",
        awayTeam: "Maylands G 3",
      },
      {
        eventDate: "Wednesday 26th",
        homeTeam: "Mossford 2",
        awayTeam: "Cranston Pk 2",
      },
      {
        eventDate: "Wednesday 26th",
        homeTeam: "Maylands G 5 (NRCC)",
        awayTeam: "Maylands G 6",
      },
      {
        eventDate: "Wednesday 26th",
        homeTeam: "Mossford 4",
        awayTeam: "Maylands G 9 (NRCC)",
      },
      {
        eventDate: "Wednesday 26th",
        homeTeam: "Mossford 5",
        awayTeam: "Frenford 2",
      },
      {
        eventDate: "Wednesday 26th",
        homeTeam: "Cranston Pk 4",
        awayTeam: "Maylands G 11",
      },
      {
        eventDate: "Wednesday 26th",
        homeTeam: "Maylands G 18 (NRCC)",
        awayTeam: "Maylands G 17",
      },
      {
        eventDate: "Thursday 27th",
        homeTeam: "Maylands G 4",
        awayTeam: "Woodford Wells",
      },
      {
        eventDate: "Thursday 27th",
        homeTeam: "Maylands G 12",
        awayTeam: "Trinity 2",
      },
      {
        eventDate: "Thursday 27th",
        homeTeam: "Maylands G 14",
        awayTeam: "Cranston Pk 5",
      },
      {
        eventDate: "Thursday 27th",
        homeTeam: "Mossford 6",
        awayTeam: "Maylands G 13",
      },
      {
        eventDate: "Thursday 27th",
        homeTeam: "Trinity 1",
        awayTeam: "Mossford 3",
      },
      {
        eventDate: "Friday 28th",
        homeTeam: "Maylands G 19 (CR)",
        awayTeam: "Maylands G 15",
      },
      {
        eventDate: "Friday 28th",
        homeTeam: "Wellgate (Abridge)",
        awayTeam: "Cranston Pk 3",
      },
    ],
  },
  {
    date: "31st March",
    fixtures: [
      {
        eventDate: "Monday 31st",
        homeTeam: "Woodford Wells",
        awayTeam: "Cranston Pk 1",
      },
      {
        eventDate: "Tuesday 1st",
        homeTeam: "Maylands G 6",
        awayTeam: "Trinity 1",
      },
      {
        eventDate: "Tuesday 1st",
        homeTeam: "Maylands G 16",
        awayTeam: "Maylands G 18 (NRCC)",
      },
      {
        eventDate: "Tuesday 1st",
        homeTeam: "Frenford 2",
        awayTeam: "Cranston Pk 3",
      },
      {
        eventDate: "Tuesday 1st",
        homeTeam: "Cranston Pk 5",
        awayTeam: "Maylands G 13",
      },
      {
        eventDate: "Wednesday 2nd",
        homeTeam: "Mossford 2",
        awayTeam: "Maylands G 4",
      },
      {
        eventDate: "Wednesday 2nd",
        homeTeam: "Maylands G 9 (NRCC)",
        awayTeam: "Mossford 3",
      },
      {
        eventDate: "Wednesday 2nd",
        homeTeam: "Maylands G 7 (NRCC)",
        awayTeam: "Maylands G 5 (NRCC)",
      },
      {
        eventDate: "Wednesday 2nd",
        homeTeam: "Mossford 4",
        awayTeam: "Maylands G 8",
      },
      {
        eventDate: "Wednesday 2nd",
        homeTeam: "Mossford 5",
        awayTeam: "Maylands G 12",
      },
      {
        eventDate: "Wednesday 2nd",
        homeTeam: "Maylands G 10 (NRCC)",
        awayTeam: "Cranston Pk 4",
      },
      {
        eventDate: "Thursday 3rd",
        homeTeam: "Mossford 6",
        awayTeam: "Maylands G 19 (CR)",
      },
      {
        eventDate: "Thursday 3rd",
        homeTeam: "Maylands G 3",
        awayTeam: "Maylands G 1",
      },
      {
        eventDate: "Thursday 3rd",
        homeTeam: "Maylands G 11",
        awayTeam: "Wellgate (Abridge)",
      },
      {
        eventDate: "Thursday 3rd",
        homeTeam: "Maylands G 17",
        awayTeam: "Maylands G 14",
      },
      {
        eventDate: "Thursday 3rd",
        homeTeam: "Cranston Pk 2",
        awayTeam: "Mossford 1",
      },
    ],
  },
  {
    date: "7th April",
    fixtures: [
      {
        eventDate: "Monday 7th",
        homeTeam: "Cranston Pk 3",
        awayTeam: "Maylands G 11",
      },
      {
        eventDate: "Tuesday 8th",
        homeTeam: "Maylands G 8",
        awayTeam: "Maylands G 9 (NRCC)",
      },
      {
        eventDate: "Tuesday 8th",
        homeTeam: "Maylands G 13",
        awayTeam: "Maylands G 17",
      },
      {
        eventDate: "Tuesday 8th",
        homeTeam: "Frenford 1",
        awayTeam: "Mossford 4",
      },
      {
        eventDate: "Wednesday 9th",
        homeTeam: "Mossford 1",
        awayTeam: "Maylands G 3",
      },
      {
        eventDate: "Wednesday 9th",
        homeTeam: "Maylands G 2 (NRCC)",
        awayTeam: "Woodford Wells",
      },
      {
        eventDate: "Wednesday 9th",
        homeTeam: "Mossford 3",
        awayTeam: "Maylands G 6",
      },
      {
        eventDate: "Wednesday 9th",
        homeTeam: "Cranston Pk 4",
        awayTeam: "Trinity 2",
      },
      {
        eventDate: "Wednesday 9th",
        homeTeam: "Maylands G 18 (NRCC)",
        awayTeam: "Maylands G 15",
      },
      {
        eventDate: "Thursday 10th",
        homeTeam: "Mossford 6",
        awayTeam: "Cranston Pk 5",
      },
      {
        eventDate: "Thursday 10th",
        homeTeam: "Maylands G 4",
        awayTeam: "Cranston Pk 2",
      },
      {
        eventDate: "Thursday 10th",
        homeTeam: "Maylands G 12",
        awayTeam: "Frenford 2",
      },
      {
        eventDate: "Thursday 10th",
        homeTeam: "Maylands G 14",
        awayTeam: "Maylands G 16",
      },
      {
        eventDate: "Thursday 10th",
        homeTeam: "Cranston Pk 1",
        awayTeam: "Mossford 2",
      },
      {
        eventDate: "Thursday 10th",
        homeTeam: "Trinity 1",
        awayTeam: "Maylands G 7 (NRCC)",
      },
      {
        eventDate: "Friday 11th",
        homeTeam: "Wellgate (Abridge)",
        awayTeam: "Maylands G 10 (NRCC)",
      },
    ],
  },
];

// to change teams names from the Romford website to those that I have chosen
const fixtureTeamLookup = new Map<string, string>([
  ["Maylands G 10 (NRCC)", "Maylands Green 10"],
  ["Maylands G 1", "Maylands Green 1"],
  ["Maylands G 6", "Maylands Green 6"],
  ["Maylands G 9 (NRCC)", "Maylands Green 9"],
  ["Maylands G 13", "Maylands Green 13"],
  ["Maylands G 16", "Maylands Green 16"],
  ["Maylands G 8", "Maylands Green 8"],
  ["Maylands G 2 (NRCC)", "Maylands Green 2"],
  ["Maylands G 7 (NRCC)", "Maylands Green 7"],
  ["Maylands G 5 (NRCC)", "Maylands Green 5"],
  ["Maylands G 3", "Maylands Green 3"],
  ["Maylands G 11", "Maylands Green 11"],
  ["Maylands G 17", "Maylands Green 17"],
  ["Maylands G 14", "Maylands Green 14"],
  ["Maylands G 15", "Maylands Green 15"],
  ["Maylands G 4", "Maylands Green 4"],
  ["Maylands G 19 (CR)", "Maylands Green 19"],
  ["Wellgate (Abridge)", "Wellgate"],
  ["Maylands G 12", "Maylands Green 12"],
  ["Maylands G 18 (NRCC)", "Maylands Green 18"],
]);

function getFixedTeamName(teamName: string) {
  if (fixtureTeamLookup.has(teamName)) {
    return fixtureTeamLookup.get(teamName)!;
  }
  return teamName;
}

const monthNumbers = new Map<string, number>([
  ["January", 0],
  ["February", 1],
  ["March", 2],
  ["April", 3],
  ["May", 4],
  ["June", 5],
  ["July", 6],
  ["August", 7],
  ["September", 8],
  ["October", 9],
  ["November", 10],
  ["December", 11],
]);

const fixedFixtureWeeks = fixtureWeeks.flatMap((fixtureWeek) => {
  const fixtureWeekParts = fixtureWeek.date.split(" ");
  const fixtureWeekDayWithSuffix = fixtureWeekParts[0];
  const fixtureWeekMonth = fixtureWeekParts[1];
  const fixtureWeekMonthNumber = monthNumbers.get(fixtureWeekMonth);
  const fixtureWeekDay = Number.parseInt(
    fixtureWeekDayWithSuffix.replace(/\D/g, ""),
  );
  return fixtureWeek.fixtures.map((fixture) => {
    const eventDate = fixture.eventDate;
    const number = eventDate.split(" ")[1];
    // remove suffix e.g rd, th, st
    const day = Number.parseInt(number.replace(/\D/g, ""));
    let fixtureMonth = fixtureWeekMonthNumber!;

    if (day < fixtureWeekDay) {
      fixtureMonth = fixtureWeekMonthNumber! + 1;
    }
    const year = fixtureMonth < 6 ? 2025 : 2024;
    return {
      date: new Date(year, fixtureMonth, day),
      homeTeam: getFixedTeamName(fixture.homeTeam),
      awayTeam: getFixedTeamName(fixture.awayTeam),
    };
  });
});
const maylands = "Maylands";
export const maylandsFixtures = fixedFixtureWeeks.filter((fixture) => {
  return (
    fixture.homeTeam.startsWith(maylands) ||
    fixture.awayTeam.startsWith(maylands)
  );
});
