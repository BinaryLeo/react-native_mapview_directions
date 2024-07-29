import { Alert, Text, View, TouchableOpacity } from 'react-native';
import { getCurrentPositionAsync, LocationAccuracy, LocationObject, requestForegroundPermissionsAsync, watchPositionAsync } from 'expo-location';
import React from 'react';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Ionicons } from "@expo/vector-icons";

export default function App() {
  const [permissionStatus, setPermissionStatus] = React.useState<boolean>(false);
  const [location, setLocation] = React.useState<LocationObject | null>(null);
  const [pitchValue, setPitchValue] = React.useState<number>(40);
  const [destination, setDestination] = React.useState({ latitude: -29.3409, longitude: -49.7267 });
  const [moveToDestination, setMoveToDestination] = React.useState(false);
  const mapRef = React.useRef<MapView>(null);
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  async function getForegroundPermissionsAsync() {
    const { granted } = await requestForegroundPermissionsAsync();
    if (granted) {
      setPermissionStatus(true);
      const location = await getCurrentPositionAsync({});
      setLocation(location);
      console.log(location);
    } else {
      setPermissionStatus(false);
    }
  }

  React.useEffect(() => { getForegroundPermissionsAsync(); }, []);

  React.useEffect(() => {
    if (mapRef.current && location && !moveToDestination) {
      mapRef.current.animateCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        zoom: 15,
        pitch: pitchValue,
      });
    }
  }, [pitchValue, location]);

  const moveFromCurrenttoDestination = () => {
    setMoveToDestination(true);
    if (mapRef.current && location) {
      mapRef.current.animateCamera({
        center: {
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
        zoom: 16,
        pitch: pitchValue,
      });
    }
  }
  const backToCurrentLocation = () => {
    setMoveToDestination(false);
    if (mapRef.current && location) {
      mapRef.current.animateCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        zoom: 15,
        pitch: pitchValue,
      });
    }
  }
  const updateLocation = async () => {
    const location = await getCurrentPositionAsync({});
    setLocation(location);
    if (mapRef.current && location) {
      mapRef.current.animateCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        zoom: 15,
        pitch: pitchValue,
      });
    }
  }
  const handlePitchUpdate = (newPitchValue: number) => {
    newPitchValue >= 0 && newPitchValue <= 70 ? setPitchValue(newPitchValue) : Alert.alert('Pitch can only be between 0 and 70');
  };

  React.useEffect(() => {
    const watchPosition = async () => {
      await watchPositionAsync(
        { accuracy: LocationAccuracy.Highest, timeInterval: 1000, distanceInterval: 0 },
        (location) => {
          setLocation(location);
        }
      );
    };
    watchPosition();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {location && (
        <MapView
          mapType='standard'
          ref={mapRef}
          style={{ flex: 1, width: '100%' }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <MapViewDirections
            origin={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
            destination={destination}
            apikey={apiKey || ''}
            strokeWidth={3}
            strokeColor="hotpink"
          />
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You"
            description="Your location"
          />
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title="Destination"
            description="Your destination"
          />
        </MapView>
      )}
      <View style={{ width: 300, height: 60, position: 'absolute', justifyContent: 'space-between', flexDirection: 'row', gap: 10, top: 35, zIndex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)', alignItems: 'center', padding: 10, borderRadius: 9 }}>
        <TouchableOpacity onPress={() => handlePitchUpdate(pitchValue + 5)}>
          <Ionicons name="add" size={24} color="black" />
        </TouchableOpacity>
        <Text>
          Pitch:
          {pitchValue}</Text>
        <TouchableOpacity onPress={() => handlePitchUpdate(pitchValue - 5)}>
          <Ionicons name="remove" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={moveFromCurrenttoDestination}>
          <Ionicons name="navigate" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => backToCurrentLocation()}>
          <Ionicons name="locate" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => updateLocation()}>
          <Ionicons name="refresh" size={24} color="black" />
        </TouchableOpacity>

      </View>
    </View>
  );
};
