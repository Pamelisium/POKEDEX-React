import React, { useEffect, useState} from 'react';
import ReactModal from 'react-modal';
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import CanvasJSReact from '@canvasjs/react-charts';
import { motion } from "framer-motion";
// import Loading from './loading';
import 'bootstrap/dist/css/bootstrap.min.css';

// variables for displaying charts
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

// main function for Pokédex web application
export function App() {
  const [pokemon, setPokemon] = useState([])
  const [count, setCount] = useSessionStorage('count', 10)
  const [input, setInput] = useState('')
  const [query, setQuery] = useSessionStorage('query', '')
  const [searchParam] = useState(['name', 'url'])
  const [sortParam, setSortParam] = useState('Lowest to Highest ID')
  
  // CSS style specifications for Home Page header
  const header = {
    display: 'flex',
    alignItems: 'center',
    padding: '5px',
    flexWrap: 'wrap'
  };

  // CSS style specifications for Home Page header items
  const headerItems = {
    margin: '10px'
  }

  // CSS style specifications for Home Page search bar
  const searchBar = {
    margin: '10px',
    width: '57%',
    minWidth: '300px'
  }
  
  // CSS style specifications for 'Load More' button
  const loadButton = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px'
  };
  
  // function for fetching Pokémon list from PokéAPI
  const fetchPokemon = () => {
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=1010&offset=0`)
      .then(response => {
        return response.json()
      })
      .then(data => {
        setPokemon(data['results'])
      })
  }

  useEffect(() => {
    fetchPokemon()
  })

  // function for searching and filtering Pokémon by name or ID
  const searchFilter = (items) => {
    return items.filter((item) => {
      return searchParam.some((newItem) => {
        if(newItem === 'name'){
          return (item[newItem]
            ?.toLowerCase()
            .indexOf(query.toLowerCase()) > -1)
        }
        else{
          return (item[newItem].slice(-5)
            ?.indexOf(query).toString() > -1)
        }
      });
   });
  }

  // function for sorting filtered Pokémon list by name or ID (ascending or descending)
  const sortFiltered = (items) => {
    if(sortParam === 'Lowest to Highest ID'){
      return searchFilter(items).sort((a, b) => {
        return Math.sign(parseInt(a['url'].slice(a['url'].search('n') + 2, -1)) - parseInt(b['url'].slice(b['url'].search('n') + 2, -1)));
      }).slice(0, count)
    }
    else if(sortParam === 'Highest to Lowest ID'){
      return searchFilter(items).sort((a, b) => {
        return Math.sign(parseInt(b['url'].slice(b['url'].search('n') + 2, -1)) - parseInt(a['url'].slice(a['url'].search('n') + 2, -1)));
      }).slice(0, count)
    }
    else if(sortParam === 'A to Z'){
      return searchFilter(items).sort((a, b) => {
        return a['name'].localeCompare(b['name']);
      }).slice(0, count)
    }
    else if(sortParam === 'Z to A'){
      return searchFilter(items).sort((a, b) => {
        return b['name'].localeCompare(a['name']);
      }).slice(0, count)
    }
  }

  return (
    <>
      <Form onSubmit={(e) => e.preventDefault()}>
        <div style={header}>
          <h1 style={headerItems}>Pokédex</h1>
          <Form.Control style={searchBar} type='text' placeholder='Search Pokémon by name or ID' value={input} onChange={(e) => setInput(e.target.value)}/>
          <Button style={headerItems} variant='primary' type='submit' onClick={() => setQuery(input)}>
            Search
          </Button>
          <Button style={headerItems} variant='primary' type='submit' onClick={() => {
            setInput('')
            setQuery('')
          }}>
            Clear
          </Button>
          <h5 style={headerItems}>Sort:</h5>
          <DropdownButton style={headerItems} id='dropdown-sort' title={sortParam}>
            <Dropdown.Item onClick={(e) => setSortParam(e.target.textContent)}>Lowest to Highest ID</Dropdown.Item>
            <Dropdown.Item onClick={(e) => setSortParam(e.target.textContent)}>Highest to Lowest ID</Dropdown.Item>
            <Dropdown.Item onClick={(e) => setSortParam(e.target.textContent)}>A to Z</Dropdown.Item>
            <Dropdown.Item onClick={(e) => setSortParam(e.target.textContent)}>Z to A</Dropdown.Item>
          </DropdownButton>
        </div>
      </Form>
      {pokemon.length > 0 && (
        <Row style={{padding: '20px'}} xs={1} md={2} lg={5} className='g-4'>
          {sortFiltered(pokemon).map(pm => (
            <CardView url={pm.url}/>
          ))}
        </Row>
      )}
      <div style={loadButton}>
        <Button onClick={() => setCount(count+10)}>Load More</Button>
      </div>
    </>
  );
}

// function for displaying Pokémon Card View List
function CardView({url}) {
  const [details, setDetails] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  
  // CSS style specifications for Pokédex ID in Card View List
  const cardID = {
    color: 'gray',
    fontWeight: 'bold'
  }
  
  // function for fetching details of each Pokémon from PokéAPI using the 'url' property
  const fetchDetails = () => {
    fetch(url)
      .then(response => {
        return response.json()
      })
      .then(data => {
        setDetails(data)
      })
  }

  useEffect(() => {
    fetchDetails()
  })

  return (
    <Col>
      <Card onClick={() => setIsOpen(true)}>
        <Card.Img variant='top' src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${details.id}.png`} />
        <Card.Body>
          <Card.Text>
            {details.id < 10 &&
              <p style={cardID}>#000{details.id}</p>
            }
            {details.id >= 10 && details.id < 100 &&
              <p style={cardID}>#00{details.id}</p>
            }
            {details.id >= 100 && details.id < 1000 &&
              <p style={cardID}>#0{details.id}</p>
            }
            {details.id >= 1000 &&
              <p style={cardID}>#{details.id}</p>
            }
            <h4 style={{textTransform: 'capitalize'}}>{details.name}</h4>
            <Types types={details.types} />
          </Card.Text>
        </Card.Body>
      </Card>
      <ReactModal
        isOpen={isOpen}
        contentLabel='Example Modal'
        ariaHideApp={false}
        onRequestClose={() => setIsOpen(false)}
      >
        <DetailView id={details.id}/>
      </ReactModal>
    </Col>
  );
}

// function for displaying type/s of a Pokémon
function Types({types}) {
  const pokeTypes = types?.map(pokeType => {
    return pokeType.type.name;
  }).reduce((prev, curr) => [prev, ', ', curr])
  return (
    <p style={{textTransform: 'capitalize'}}>Types: {pokeTypes}</p>
  );
}

// function for displaying Detailed Info View of a Pokémon
function DetailView({id}) {
  const [details, setDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [pokeID, setPokeID] = useState(id)

  // CSS style specifications for Detailed Info View
  const detailView = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap'
  }  
  
  // CSS style specifications for Pokémon name in Detailed Info View
  const pokeName = {
    textTransform: 'capitalize',
    marginRight: '10px'
  }

  // CSS style specifications for Previous and Next buttons in Detailed Info View
  const prevNext = {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '25px'
  }
  
  // function for fetching details of each Pokémon from PokéAPI using the 'id' property
  const fetchDetails = () => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokeID}`)
      .then(response => {
        return response.json()
      })
      .then(data => {
        setLoading(false)
        setDetails(data)
      })
  }

  useEffect(() => {
    fetchDetails()
  })

  // function for creating array of respective stat scores of a Pokémon
  const statArray = details.stats?.map(pokeStat => {
      return {y: pokeStat.base_stat, label: pokeStat.stat.name};
  })

  // specifications for Pokémon's stats bar chart
  const options = {
    animationEnabled: true,
    theme: 'light2',
    width: 550,
    height: 260,
    title:{
      text: ''
    },
    axisX: {
      title: 'Stats',
      reversed: true,
    },
    axisY: {
      title: 'Base Value',
      includeZero: true,
      maximum: 200,
      interval: 20,
    },
    data: [{
      type: 'bar',
      dataPoints: statArray
    }]
  }
  
  return (
    <>
      {loading && <Loading />}
      {!loading && (
        <div style={detailView}>
          <div>
            <img alt={details.name} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${details.id}.png`} />
          </div>
          <div>
            <div style={{display: 'flex'}}>
              <h3 style={pokeName}>{details.name}</h3>
              {details.id < 10 &&
                <h3 style={{color: 'gray'}}>#000{details.id}</h3>
              }
              {details.id >= 10 && details.id < 100 &&
                <h3 style={{color: 'gray'}}>#00{details.id}</h3>
              }
              {details.id >= 100 && details.id < 1000 &&
                <h3 style={{color: 'gray'}}>#0{details.id}</h3>
              }
              {details.id >= 1000 &&
                <h3 style={{color: 'gray'}}>#{details.id}</h3>
              }
            </div>
            <p>Height: {details.height/10} meter(s)</p>
            <p>Weight: {details.weight/10} kilogram(s)</p>
            <Types types={details.types} />
            <Abilities abilities={details.abilities} />
            <Weaknesses types={details.types} />
            <div>
              <CanvasJSChart options = {options}/>
            </div>
          </div>
        </div>
      )}
      <div style={prevNext}>
        <Button style={{marginRight: '20px'}} onClick={() => {(pokeID > 1) ? setPokeID(pokeID-1) : setPokeID(1010)}}>Previous</Button>
        <Button onClick={() => {(pokeID < 1010) ? setPokeID(pokeID+1) : setPokeID(1)}}>Next</Button>
      </div>
    </>
  );
}

// function for displaying ability/abilities of a Pokémon
function Abilities({abilities}) {
  const pokeAbilities = abilities?.map(pokeAbility => {
    return pokeAbility.ability.name;
  }).reduce((prev, curr) => [prev, ', ', curr])
  return (
    <p style={{textTransform: 'capitalize'}}>Abilities: {pokeAbilities}</p>
  );
}

// function for displaying weakness/es of a Pokémon
function Weaknesses({types}){
  const weaknesses = {
    'normal': ['rock', 'ghost', 'steel'],
    'fighting': ['flying', 'poison', 'psychic', 'bug', 'ghost', 'fairy'],
    'flying': ['rock', 'steel', 'electric'],
    'poison': ['poison', 'ground', 'rock', 'ghost', 'steel'],
    'ground': ['flying', 'bug', 'grass'],
    'rock': ['fighting', 'ground', 'steel'],
    'bug': ['fighting', 'flying', 'poison', 'ghost', 'steel', 'fire', 'fairy'],
    'ghost': ['normal', 'dark'],
    'steel': ['steel', 'fire', 'water', 'electric'],
    'fire': ['rock', 'fire', 'water', 'dragon'],
    'water': ['water', 'grass', 'dragon'],
    'grass': ['flying', 'poison', 'bug', 'steel', 'fire', 'grass', 'dragon'],
    'electric': ['ground', 'grass', 'electric', 'dragon'],
    'psychic': ['steel', 'psychic', 'dark'],
    'ice': ['steel', 'fire', 'water', 'ice'],
    'dragon': ['steel', 'fairy'],
    'fairy': ['poison', 'steel', 'fire'],
    'dark': ['fighting', 'dark', 'fairy']
  }
  var pokeWeaknesses = []
  const pokeTypes = types?.map(pokeType => {
    return pokeType.type.name;
  })
  for(let i = 0; i < pokeTypes.length; i++){
    pokeWeaknesses.push(...weaknesses[pokeTypes[i]])
  }
  pokeWeaknesses = [...new Set(pokeWeaknesses)]

  return (
    <p style = {{textTransform: 'capitalize'}}>Weaknesses: {pokeWeaknesses.reduce((prev, curr) => [prev, ', ', curr])}</p>
  );
}

// function for displaying loading animation
function Loading() {
  const LoadingDot = {
    display: "block",
    width: "2rem",
    height: "2rem",
    backgroundColor: "black",
    borderRadius: "50%"
  };
  
  const LoadingContainer = {
    width: "10rem",
    height: "5rem",
    display: "flex",
    justifyContent: "space-around"
  };
  
  const ContainerVariants = {
    initial: {
      transition: {
        staggerChildren: 0.2
      }
    },
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const DotVariants = {
    initial: {
      y: "0%"
    },
    animate: {
      y: "100%"
    }
  };
  
  const DotTransition = {
    duration: 0.5,
    yoyo: Infinity,
    ease: "easeInOut"
  };

  return (
    <div
      style={{
        paddingTop: "5rem",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <motion.div
        style={LoadingContainer}
        variants={ContainerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.span
          style={LoadingDot}
          variants={DotVariants}
          transition={DotTransition}
        />
        <motion.span
          style={LoadingDot}
          variants={DotVariants}
          transition={DotTransition}
        />
        <motion.span
          style={LoadingDot}
          variants={DotVariants}
          transition={DotTransition}
        />
      </motion.div>
    </div>
  );
}

// function for getting value of variable in session storage
function getStorageValue(key, defaultValue) {
  const saved = sessionStorage.getItem(key);
  const initial = JSON.parse(saved);
  return initial || defaultValue;
}

// function for storing and using a session storage variable
export const useSessionStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};