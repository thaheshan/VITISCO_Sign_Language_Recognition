import cv2
import numpy as np
import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

from matplotlib import pyplot as plt
import mediapipe as mp
import time


#for build and train a LSTM neural netweok
#we need to import tensorflow libraries
#the LSTM (Long Short Term) neural network, which is, 
#which is, a special type of recurrent neural network.
#it specially designed for manage/handke sequential data efficiently.

#RNN will not have long -term memory for the dependencies but LSTM will hild long term memeory here
#and why we chpse to train data with LSTM netwrok here for, hand detection ?
# because, hand sign detection means , analyzing a sequence of frames (include actions) from a video
#for every vddeos, it will have different hand positions or gestures fro the series of time.

#it can remember past frames.
#this LSTM network can store past sequence of actions for the detection in a long-term goal.
#it can easily seperate every pattern of gestures by per taken time
#it will reduce the noise from the frame dataset.
#it will make past datassets more flexible fore real word sign detection.

#for that first need to import needed dependecies for the LSTM neural network with tensorflow

#how we make the LSTM neural network implementation with tensorflow here to make a proper hand sign detection model
#1.extract the correct keypoints for the face, pose and hand landmarks
#2.convert the hand keypoints over time into sequences frames per every gesture ina time sequence 
#3.LSTM model training with the extracted dataset (train a LSTM model to learn and  classify gestures based on their motion patterns)
#4.build it accuracy with changing the components values (example epoches)

# Import Mediapipe holistic and drawing utilities
mp_holistic = mp.solutions.holistic
mp_drawing = mp.solutions.drawing_utils


def media_pipe_detection_model(image, model):
       
       """
    Perform detection using Mediapipe's holistic model.
    Args:
        image: The input BGR image.
        model: The Mediapipe holistic model instance.

    Returns:
        Processed BGR image and detection results.
    """
    
       image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
       image.flags.writeable = False  # Improve performance by disabling write
       results = model.process(image)  # Perform detection
       image.flags.writeable = True  # Re-enable writing
       image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)  # Convert RGB back to BGR
       return image, results

def draw_the_landmarks(image, results):
    """
    Draw landmarks for face, pose, and hands on the image.
    Args:
        image: The input image on which landmarks are drawn.
        results: The detection results from Mediapipe.
    """
    if results.face_landmarks:
        mp_drawing.draw_landmarks(
            image, 
            results.face_landmarks, 
            mp_holistic.FACEMESH_TESSELATION,
            mp_drawing.DrawingSpec(color=(80, 110, 10), thickness=1, circle_radius=1),
            mp_drawing.DrawingSpec(color=(80, 256, 121), thickness=1, circle_radius=1))

    if results.pose_landmarks:
        mp_drawing.draw_landmarks(
            image, 
            results.pose_landmarks, 
            mp_holistic.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=4),
            mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2))

    if results.left_hand_landmarks:
        mp_drawing.draw_landmarks(
            image, 
            results.left_hand_landmarks, 
            mp_holistic.HAND_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(121, 22, 76), thickness=2, circle_radius=4),
            mp_drawing.DrawingSpec(color=(121, 44, 250), thickness=2, circle_radius=2))

    if results.right_hand_landmarks:
        mp_drawing.draw_landmarks(
            image, 
            results.right_hand_landmarks, 
            mp_holistic.HAND_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=4),
            mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2))

def extract_keypoints(results):
    """
    Extract keypoints from Mediapipe results for pose, face, and hands.
    Args:
        results: The detection results from Mediapipe.

    Returns:
        A flattened numpy array of keypoints.
    """
    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]) if results.pose_landmarks else np.zeros((33, 4))
    face = np.array([[res.x, res.y, res.z] for res in results.face_landmarks.landmark]) if results.face_landmarks else np.zeros((468, 3))
    left_hand = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]) if results.left_hand_landmarks else np.zeros((21, 3))
    right_hand = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]) if results.right_hand_landmarks else np.zeros((21, 3))
    return np.concatenate([pose.flatten(), face.flatten(), left_hand.flatten(), right_hand.flatten()])


# Define constants
DATA_COLLECTION_PATH = os.path.join('MP_Data')
data_actions = np.array(["thanks", "hello", "I_love_you"])
no_of_frame_for_data = 30
sequence_length = 30

# Create directories for data storage
for action in data_actions:
    for sequence in range(no_of_frame_for_data):
        try:
            os.makedirs(os.path.join(DATA_COLLECTION_PATH, action, str(sequence)))
        except FileExistsError:
            pass

def main():
    # Initialize webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Unable to access the camera.")
        return

    # Set up Mediapipe holistic model
    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        for action in data_actions:
            for sequence in range(no_of_frame_for_data):
                for frame_number in range(sequence_length):
                    ret, frame = cap.read()
                    if not ret:
                        print("Failed to capture video")
                        break

                    # Perform detection
                    image, results = media_pipe_detection_model(frame, holistic)

                    # Draw landmarks on the image
                    draw_the_landmarks(image, results)

                    # Show collection status
                    if frame_number == 0:
                        
                            hold_duration = 2
                            start_time = time.time()

                            while time.time() - start_time < hold_duration:
                                template_image = image.copy()

                                cv2.putText(image, "Starting data collection", (120, 200), 
                                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 4, cv2.LINE_AA)
                            
                                cv2.putText(image, f"Collecting {action} for video {sequence}", (15, 12), 
                                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 4, cv2.LINE_AA)

                                cv2.imshow("Holistic Detection", template_image)

                    # Save keypoints
                    keypoints = extract_keypoints(results)
                    npy_path = os.path.join(DATA_COLLECTION_PATH, action, str(sequence), str(frame_number))
                    np.save(npy_path, keypoints)

                    # Display the frame
                    cv2.imshow('Holistic Detection', image)

                    # Exit loop if 'q' is pressed
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        cap.release()
                        cv2.destroyAllWindows()
                        return
                    




    #create a structure for pre-process and structuring the data for a proper training for the detection model.

#create a label collection loop for the make the label name for every ctions in a smooth order for a large data set.
#for a large a data set, we cannot hold up for all labels in one array.


#we make this code for the order of labels for every kind of actions, for those labels with this loop we are going to rder the action labels into a array
#with number order ring, because after pre process the data and when we going to train the datas for detection in machine learning
#it will only identify the  number of the labels, as per the order of the label numbering it will train the data
#like 0,1,2,3,4...............

#create a loop of numbering for the every labels as per the count of labels
#like............
# actions = ['a','b','c']
# label_mapping = {'a' : 0 , 'b' : 1 , 'c' : 2 }

    label_mapping = {label : num for num, label in enumerate(actions)}

#to vollect all of the data and strcucture of those data, for that we are going to use arrays for every data set

#to structure the data 
#declare two variables of sequences and labels for store the all labels and action of sequences as per order in one list
#in sequences list for every label order in every spces stre the collecred data for the labels in the sequences variable
#in the labels variable store the labes as per order in the list


    sequences , labels = [], []

    #execute a loop for every action type in the collection of actions
    #
    for action in actions:

        #for into the each action it will run the action sequences  as per it's count
        #if we have 50 sequences for one action this loop will iterate through 50 times for that one sequence
        for sequence in range(no_of_sequences):
            #creating this for before adding the multiple sequences into the proper file it will be stre into a cmmon file for all sequences here

            Window = []

            #then after store the sequences into a common file of window,
            #as per the frame count it will split the data

            for frame_num in range(sequences_length):

                #and load the every proper split data as per the frame count,
                #load the pre -extracted feature files for speed up the traing progress in the model training time with this datas
                #to train the data to the model in upcoming codes, store the pre-rpocess data into .npy format
                #it means from the camera,  it will normallhy capture as raw file
                #but here we did, it as extract the kyeypints for the landmrks for the face, hands and bpdy motions and 
                #we change the collected data fromat into .npy (numpy) format
                #
                res = np.load(os.path.join(DATA_COLLECTION_PATH, action, str(seqence), "{}.npy".format(frame_num)))

                
                Window.append(res)



            sequences.append(Window)
            labels.append(label_mapping[action])

            np.array(sequences).shape
            np.array(labels).shape
            
            x = np.array(sequences)
            x.shape

            y = to_categorical(labels).astype(int)

            x_train, x_test , y_train , y_test = train_test_split(x,y,test_size=0.5)

            #start to train the data.......................................................................

            log_directory = os.path.join('Logs')
            tb_callback = TensorBoard(log_directory = log_directory)

            models = Sequential()
            models.add(LSTM(64, return_sequences =  True , activation = 'relu', input_shape = (30,1662)))
            models.add(LSTM(128, return_sequences =  True , activation = 'relu'))
            models.add(LSTM(64, return_sequences =  False , activation = 'relu'))
            models.add(Dense(64, activation = 'relu'))
            models.add(Dense(32, activation = 'relu'))

            models.add(Dense(action.shape[0]),activation = 'softmax')

            models.compile(optimizer = 'Adam',loss = 'categorical_crossentrophy', metrics = ['categorical_accuracy'] )

            models.fit(x_train,y_train,epochs = 2000, callbacks = [tb_callback])






            

            

if __name__ == "__main__":
    main()
