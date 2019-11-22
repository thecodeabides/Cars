import React from 'react';
import { FlatList, Text, View, StyleSheet, StatusBar, Image, TouchableOpacity, TouchableWithoutFeedback, AsyncStorage } from 'react-native';
import SQLite from "react-native-sqlite-storage"
SQLite.enablePromise(true);
import { Card, Title, Paragraph, Appbar } from 'react-native-paper';
import Favourites from '../Favourites/Favourites'
const theme = {
    roundness: 2,
    colors: {
        primary: 'black',
        accent: 'black',
    },
};
import { Actions } from 'react-native-router-flux';

// var db = openDatabase({ name: 'cars.db', createFromLocation : 1});

export default class home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataArr: [],
        };
        this.page = 1
        this.getDataFromDB(1)
    }

    getDataFromDB = async (index) => {
        const db = await SQLite.openDatabase({ name: 'cars.db', createFromLocation: 1, location: 'Library' }, this.openCB, this.errorCB);

        db.transaction((tx) => {
            tx.executeSql(`SELECT * FROM cars_list WHERE ROWID > ${index - 1} AND ROWID < ${index + 10}`, [], (tx, results) => {
                let len = results.rows.length;
                let dataArr = []
                for (let i = 0; i < len; i++) {
                    dataArr.push(results.rows.item(i))
                }
                this.setState(prevState => {
                    return {
                        dataArr: [...prevState.dataArr, ...dataArr]
                    }
                })
            });
        });
    }

    openCB = () => {
        console.log("OPENED");
    }
    errorCB = () => {
        console.log("OPENED");
    }
    renderItem = (item, index) => {
        return (
            <Card
                elevation={1}
                style={{
                    margin: 10
                }}
                onPress={() => this.props.navigation.push("CarDetails", item)}
            >
                <Card.Cover source={{ uri: item.image_url }} />
                <Card.Title title={`${item.manufacturer} ${item.make}`} subtitle={`${item.year} | ${item.type} | ${item.fuel} | ${item.type}`} />
                <View
                    style={{
                        borderBottomColor: 'rgba(0,0,0,0.1)',
                        borderBottomWidth: 0.5,
                    }}
                />
                <Card.Content>
                    <Title>$ {item.price}</Title>
                    <Paragraph>Locattion: {item.city}</Paragraph>
                </Card.Content>
                <View
                    style = {{
                        margin: 15
                    }}
                >
                    <Favourites
                        data={item}
                    />
                </View>

            </Card>
        )
    }
    _storeData = async (data) => {
        if (data) {
            try {
                await AsyncStorage.setItem('ISLOGGEDIN', data)
            } catch (error) {
                console.log(error);
            }
        }
    }

    logout = () => {
        Actions.reset("Login")
        this._storeData(JSON.stringify(false))
    }
    render() {
        console.log("DATAT", this.state.dataArr);

        return (
            <View style={styles.container}>
                <StatusBar
                    backgroundColor={theme.colors.primary} barStyle="light-content"
                />
                <Appbar.Header
                    theme={theme}
                >
                    <Appbar.Content
                        title="Home"
                    />
                    <TouchableOpacity
                        onPress={() => this.logout()}
                    >
                        <Image
                            style={{
                                height: 25,
                                width: 25,
                                marginRight: 10
                            }}
                            source={require('../../images/logout.png')}
                        />
                    </TouchableOpacity>
                </Appbar.Header>
                <FlatList
                    data={this.state.dataArr}
                    contentContainerStyle={{
                        marginBottom: 100
                    }}
                    renderItem={({ item, index }) => this.renderItem(item, index)}
                // onEndReached = {this.getDataFromDB(this.page++)}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
});