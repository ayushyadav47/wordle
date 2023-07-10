import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Modal, Image, Alert } from 'react-native';
import { NativeBaseProvider, Heading, Switch, useColorMode } from 'native-base';

import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

import Keyboard from './components/Keyboard';
import {CLEAR, ENTER} from './components/constants';

import { generate} from 'random-words';
import { wordList } from './node_modules/random-words/index'
import LottieView from 'lottie-react-native';
import Sound from 'react-native-sound'

const App = () => {

  const [info, setInfo] = useState(false);
  const [settings, setSettings] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isLost, setIsLost] = useState(false);
  const [grid, setGrid] = useState([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [currentColumn, setCurrentColumn] = useState(0);
  const [latestWord, setLatestWord] = useState(generate({ minLength: 5, maxLength: 5 }))
  const [tries, setTries] = useState(0)
  const [greenCaps, setGreenCaps] = useState([]);
  const [yellowCaps, setYellowCaps] = useState([]);
  const [greyCaps, setGreyCaps] = useState([]);
  const [hardMode, setHardMode] = useState(false)

  console.log(latestWord)

  const playSound = (sound) => {
    const soundVar = new Sound(sound, Sound.MAIN_BUNDLE, (err) => {
      if (err) {
        console.log("NOT ABLE TO PLAY")
      }
    });
    setTimeout(() => {
      soundVar.play()
    }, 250)
    soundVar.release();
    return soundVar
  }

  const sound = [
    require('./components/assets/jojos-golden-wind.mp3'),
    require('./components/assets/areyousureaboutthat.mp3'),
    require('./components/assets/sigma.mp3'),
    require('./components/assets/women-haha.mp3'),
  ]

  const handleKeyPressed = (key) => {
    if (key === CLEAR) {
      clearLastLetter();
    } else if (key === ENTER) {
      moveToNextRow();
    } else {
      fillSquare(key);
    }
  };

  const fillSquare = (key) => {
    if (currentColumn === 5) {
      return;
    }

    setGrid((prevGrid) => {
      const updatedGrid = [...prevGrid];
      if (!updatedGrid[currentRow]) {
        updatedGrid[currentRow] = Array(6).fill('');
      }
      updatedGrid[currentRow][currentColumn] = key;
      return updatedGrid;
    });

    setCurrentColumn((prevColumn) => prevColumn + 1);
  };

  const clearLastLetter = () => {
    if (currentColumn === 0) {
      if (currentRow === 0) {
        // Clear the first cell and return
        setGrid((prevGrid) => {
          const updatedGrid = [...prevGrid];
          updatedGrid[0][0] = '';
          return updatedGrid;
        });
        return;
      }

      if (currentRow !== currentRow - 1) {
        if (currentColumn === 0) {
          setGrid((prevGrid) => {
            const updatedGrid = [...prevGrid];
            updatedGrid[currentRow][0] = '';
            return updatedGrid;
          });
          return;
        }
        return;
      }
      setCurrentRow((prevRow) => prevRow - 1);
      setCurrentColumn(4);
    } else {
      setCurrentColumn((prevColumn) => prevColumn - 1);
    }

    setGrid((prevGrid) => {
      const updatedGrid = [...prevGrid];
      updatedGrid[currentRow][currentColumn - 1] = '';
      return updatedGrid;
    });
  };

  const moveToNextRow = () => {
    
    if (currentColumn !== 5) {
      return alert("Enter a 5 letter word!");
    }

    let currWord = '';
    currWord = grid[tries].toString().replace(/,/g, "")

    if (wordList.includes(currWord) === false) {
      alert("fool bishhh")
      playSound(sound[1])
      return;
    }
    if (currentRow === 5) {
      setIsLost(true)
      return;
    }


    setTries(tries + 1)

    if (currWord === latestWord) {
      setIsWin(true);
      return;
    }

    setCurrentRow((prevRow) => prevRow + 1);
    setCurrentColumn(0);
  };

  const renderSquare = () => {
    const coloredSquares = [];

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 5; col++) {
        const key = grid[row]?.[col] || '';
        const currWord = grid[row]?.join('') || '';

        let backgroundColor = '#121213'; // Default color

        if (row < tries) {
          if (currWord[col] === latestWord[col]) {
            backgroundColor = '#538D4E'; // Mark as green
            greenCaps.push(currWord[col])
          }
          else if (latestWord.includes(currWord[col])) {
            backgroundColor = '#B59F3B'; // Mark as yellow
            yellowCaps.push(currWord[col])
          }
          else {
            backgroundColor = '#3a3a3d'; // Mark as grey
            greyCaps.push(currWord[col])
          }
        }

        coloredSquares.push(
          <View key={`${row}-${col}`} style={[styles.square, { backgroundColor }]}>
            <Text style={styles.squareText}>{key.toUpperCase()}</Text>
          </View>
        );
      }
    }

    return coloredSquares;
  };

  const resetEverything = () => {

    setGrid([]);
    setCurrentColumn(0);
    setCurrentRow(0);

    setLatestWord(generate({ minLength: 5, maxLength: 5 }));
    setTries(0);
    setGreenCaps([])
    setYellowCaps([])
    setGreyCaps([])
    setIsWin(false)
    setIsLost(false)

  }

  const ToggleHardMode = (value) => {
    setHardMode(value);
    return;
  }

  useEffect(() => {
    if (isWin) {
      playSound(sound[2]);
    }
  }, [isWin]);

  useEffect(() => {
    if (isLost) 
    {
      playSound(sound[3]);
    }
  }, [isLost]);

  return (
    <NativeBaseProvider>
      <View style={styles.container}>
        <View style={styles.navbar}>
          <Heading size="2xl" style={styles.title}>
            Wordle
          </Heading>
          <View style={styles.icon}>
            <TouchableOpacity style={{ marginVertical: 10 }} onPress={() => setInfo(true)}>
              <AntDesign name="questioncircleo" size={20} color="#FFF" style={{ marginRight: 10 }} />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginVertical: 10 }} onPress={() => setSettings(true)}>
              <Feather name="settings" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.gridContainer}>{renderSquare()}</View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={info}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setInfo(!info);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderText}>How To Play</Text>
                <TouchableOpacity onPress={() => setInfo(false)}>
                  <EvilIcons name="close" size={25} color="#fff" style={{ marginLeft: 230 }} />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalText}>Guess the Wordle in 6 tries</Text>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: '#fff', fontSize: 20, marginRight: 5 }}>{'\u2022'}</Text>
                <Text style={styles.modalText}>Each guess must be a valid 5-letter word.</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <Text style={{ color: '#fff', fontSize: 20, marginRight: 5 }}>{'\u2022'}</Text>
                <Text style={styles.modalText}>The color of the tiles will change to show how close your guess was to the word.</Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#fff', textAlign: 'left' }}>Examples</Text>
              <Image source={require('./components/assets/instructions.png')} />
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={settings}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setSettings(!settings);
          }}>
          <View style={styles.centeredView}>
            <View style={[styles.modalView]}>
              <View style={styles.modalHeader1}>
                <Text style={[styles.modalHeaderText1]}>SETTINGS</Text>
                <TouchableOpacity onPress={() => setSettings(false)}>
                  <EvilIcons name="close" size={25} color="#fff" style={{ marginLeft: 170 }} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#fff', alignSelf: 'flex-start' }}>Allow Notifications</Text>
                <Switch defaultIsChecked colorScheme="emerald" size="md" style={{ alignSelf: 'flex-end' }} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#fff', alignSelf: 'flex-start' }}>Hard Mode</Text>
                <Switch
                  colorScheme="emerald"
                  size="md"
                  style={{ alignSelf: 'flex-end' }}
                  onValueChange={ToggleHardMode}
                  value={hardMode}
                />
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isWin}
          onRequestClose={resetEverything}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalHeaderText}>Congratulations!</Text>
              <Text style={styles.modalText}>You won the game in {tries} tries.</Text>

              <LottieView
                source={require('./components/assets/107653-trophy.json')}
                autoPlay
                loop={true}
                style={styles.lottieAnimation} // Add this style to adjust the size of the animation
              />
              <TouchableOpacity
                style={styles.button}
                onPress={ () => {
                  resetEverything();
                }
              }
                  
              >
                <Text style={styles.buttonText}>Play Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isLost}
          onRequestClose={resetEverything}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalHeaderText}>Congratulations You are a Retard!</Text>
              <Text style={styles.modalText}>You Lost such an easy game bishh! </Text>
              <Text style={styles.modalText}>The word was {latestWord} </Text>
              <LottieView
                source={require('./components/assets/53040-gameover-explosion.json')}
                autoPlay
                loop={true}
                style={[styles.lottieAnimation, { marginLeft: 30 }]} // Add this style to adjust the size of the animation
              />
              <TouchableOpacity
                style={[styles.button, { backgroundColor: 'red' }]}
                onPress={resetEverything}
              >
                <Text style={styles.buttonText}>Play Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>

      <Keyboard
        onKeyPressed={handleKeyPressed}
        greenCaps={greenCaps}
        yellowCaps={yellowCaps}
        greyCaps={greyCaps}
        hardMode={hardMode}
      />
    </NativeBaseProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121213',
    ...StyleSheet.absoluteFillObject,
  },
  
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#121213',
    color: '#fff',
  },
  title: {
    color: '#fff',
    marginLeft: 130,
  },
  icon: {
    marginLeft: 30,
    flexDirection: 'row',
  },
  square: {
    width: `${(100 - 6 * 1) / 5}%`,
    height: 60,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginBottom: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  squareText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold'
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
  },
  
  modalView: {
    backgroundColor: '#121213',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalHeader1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalHeaderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalHeaderText1: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 10,
    fontSize: 15,
    color: '#fff',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#538D4E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  lottieAnimation: {
    width: 200, // Adjust the width of the animation
    height: 200, // Adjust the height of the animation
    marginBottom: 20, // Optional: Adjust the margin bottom if needed
  },
});

export default App;