import { 
  View, Text, ScrollView, KeyboardAvoidingView, 
  Platform, TextInput, TouchableOpacity, Image, 
  Alert, ActivityIndicator 
} from 'react-native';
import { useState } from 'react'
import { useRouter } from 'expo-router';
import styles from '../../assets/styles/create.styles';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useAuthStore } from '../../store/authStore';
import { API_ENDPOINTS } from '../../constants/api';


export default function Create() {
    const [title, setTitle] = useState('');
    const[caption, setCaption] = useState('');
    const[rating, setRating] = useState(3);
    const[image, setImage] = useState(null);//to display the selected image
    const[imageBase64, setImageBase64] = useState(null);//to send to the backend
    const[loading, setLoading] = useState(false);

    const router = useRouter();
    const {token} = useAuthStore();

    const pickImage = async() => {
        try {
            if(Platform.OS !== 'web'){
                const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if(status !== 'granted'){
                    Alert.alert('Permission denied', 'We need permission to access your media library to pick images.');
                    return;
                }

                let result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4,3],
                    quality: 0.5,
                    base64: true,
                });

                if(!result.canceled){
                    
                    setImage(result.assets[0].uri);

                    //if base64 is provided, use it
                    if(result.assets[0].base64){
                        setImageBase64(result.assets[0].base64);
                    } else {
                        const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {encoding: FileSystem.EncodingType.Base64});
                        setImageBase64(base64);
                    }
                }
            }
        } catch (error) {
            console.log("Error picking image:", error);
            Alert.alert('Error', 'An error occurred while picking the image. Please try again.');
        }

    }

    const handleSubmit = async() => {
        if(!title || !caption || !imageBase64 || !rating){
            Alert.alert('Error', 'Required fields are missing');
            return;
        }   

        try {
            setLoading(true);
            const uriParts = image.split(".");
            const fileType = uriParts[uriParts.length - 1];
            const imageType = fileType ? `image/${fileType.toLowerCase()}` : "image/jpeg";

            const imageDataUrl = `data:${imageType};base64,${imageBase64}`;

            const response = await fetch(API_ENDPOINTS.BOOKS, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title,
                    caption,
                    rating: rating.toString(),
                    image: imageDataUrl,
                }),
            })

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                // If response is not JSON, get text content
                const textResponse = await response.text();
                throw new Error(textResponse || "Something went wrong");
            }
            
            if(!response.ok) throw new Error(data.message || "Something went wrong");
            
            Alert.alert("Succcess", "Your book recommendation has been posted!");
            setTitle("");
            setCaption("");
            setRating(3);
            setImage(null);
            setImageBase64(null);
            router.push("/");

        } catch (error) {
            console.log("Error creating post: ", error);
            Alert.alert("Error", error.message || "Something went wrong");
        }finally {
            setLoading(false);
        }
    }

    const renderRatingPicker = () => {
        const stars = [];
        for(let i=1; i<=5; i++){
            stars.push(
                <TouchableOpacity key={i} onPress={() => setRating(i)} style={styles.starButton}>
                    <Ionicons 
                        name={ i <= rating ? "star" : "star-outline"}
                        size={32}
                        color={i <= rating ? "#fb4b00" : COLORS.textSecondary}
                    />
                </TouchableOpacity>
            );
        }

    return stars;
    }

  return (
   <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}>
            <View style={styles.card}>
                {/* header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Add book recomendation</Text>
                    <Text style={styles.subtitle}>Share your favourite reads</Text>
                </View>
                {/* form */}
                <View style = {styles.form}>
                    {/* Title Input */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Title</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons 
                                name="book-outline"
                                size={20}
                                color={COLORS.textSecondary}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter book title"
                                placeholderTextColor={COLORS.placeholderText}
                                value={title}
                                onChangeText={setTitle}
                                
                            />
                        </View>
                    </View>

                    {/* rating */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Rating</Text>
                        {renderRatingPicker()}
                    </View>

                    {/* IMAGE */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Image</Text>
                        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                            {image ? (
                                <Image source={{uri: image}} style={styles.previewImage}/>
                            ) : (
                                <View style={styles.placeholderContainer}>
                                <Ionicons name="image-outline" size={40} color={COLORS.textSecondary}/>
                                <Text style={styles.placeholderText}>Pick an image</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* caption */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Caption</Text>
                        <View style={[styles.inputContainer, {height: 100, alignItems: 'flex-start'}]}>
                            <Ionicons 
                                name="chatbubble-ellipses-outline"
                                size={20}
                                color={COLORS.textSecondary}
                                style={[styles.inputIcon, {marginTop: 10}]}
                            />
                            <TextInput
                                style={styles.textArea}
                                placeholder="Write a caption"
                                placeholderTextColor={COLORS.placeholderText}
                                value={caption}
                                onChangeText={setCaption}
                                multiline
                                numberOfLines={4}
                            />
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                        {loading ? (
                            <ActivityIndicator size="small" color={COLORS.white}/>
                        ) : (
                            <>
                                <Ionicons
                                    name='cloud-upload-outline'
                                    size={20}
                                    color={COLORS.white}
                                    style={styles.buttonIcon}
                                />

                                <Text style={styles.buttonText}>Submit</Text>

                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
   </KeyboardAvoidingView>
  )
}