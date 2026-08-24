# Morphoné: Monotimbral-Monophonic Timbre Transfer

## Overview
This repository focuses on Monotimbral-Monophonic timbre transfers utilizing variations of the DDSP (Differentiable Digital Signal Processing) Timbre Transfer algorithm originally introduced by Google Magenta. 

Within this directory, we provide two separate Google Colab notebooks. These notebooks are structured to handle the entire pipeline (setup, preprocessing, training, and inference) for two distinct models based on the DDSP-SVC architecture. The primary difference between the two implementations lies in the acoustic encoder used for feature extraction:
* **HubertSoft Encoder:** Provided in `Encoder_HubertSoft.ipynb`
* **ContentVec Encoder:** Provided in `Encoder_ContentVec.ipynb`

**Performance Note & Our Experiment:** Following our experimental evaluations, we achieved significantly more satisfying results from a musical and artistic perspective utilizing the **HubertSoft** encoder. For our specific goals, we utilized the NSynth dataset for both training and validation, sourced directly from [Google Magenta](https://magenta.withgoogle.com/datasets/nsynth). Starting from these datasets, we trained the model specifically to reproduce the sound of a 'brass' instrument. After several training epochs and evaluating various checkpoints, we successfully converted a monotimbral-monophonic saxophone audio file into a realistic brass sound.

**Custom Datasets:** Please note that while we utilized the NSynth dataset, any potential user is completely free to use their own preferred custom dataset. The only technical requirements for custom datasets are that the audio files must be in `.wav` format and each sample must have a duration of no less than 2 seconds.

---

## Repository Structure
* `Encoder_HubertSoft.ipynb`: Complete pipeline utilizing the HubertSoft encoder.
* `Encoder_ContentVec.ipynb`: Complete pipeline utilizing the ContentVec encoder.
* `/data`: Directory structure intended for hosting the acoustic datasets (Train and Validation sets).

---

## Custom Training and Inference Instructions

The provided Colab notebooks are designed to be executed sequentially. Follow the instructions below to configure the environment, perform custom training, and utilize the model for inference.

### 1. Environment Setup
Open your preferred notebook (`Encoder_HubertSoft.ipynb` or `Encoder_ContentVec.ipynb`) in Google Colab. Run the first cell to clone this repository into the execution environment and install all the necessary dependencies via `requirements.txt`. If you are using the ContentVec notebook, a dedicated cell will automatically download the required pre-trained weights from Hugging Face.

### 2. Dataset Preparation
Ensure your `.wav` dataset files are uploaded to the `./data/train/audio` and `./data/val/audio` folders. 
Run the interactive configuration cell to:
* Select up to 5 target acoustic instruments from the available dataset.
* Define the maximum number of audio samples to utilize for training.

### 3. Preprocessing
Execute the preprocessing cell. The `preprocess.py` script will process the audio files copied to the local SSD to extract the fundamental frequency (F0) and the acoustic features using the selected encoder. This step generates the matrices required by the DDSP and diffusion models.

### 4. Model Training
Run the training cell to start the optimization loop via `train_reflow.py`. The model will train based on the hyperparameters defined in the `configs/reflow.yaml` file. Checkpoints will be saved periodically inside the `./exp` directory.

### 5. Inference and Morphing
Once a checkpoint is generated, you can use the final cell of the notebook to perform inference on new audio files. 
Through the interactive graphical interface, you must:
* Select the source audio file (`.wav`).
* Select the desired trained checkpoint (`.pt`).
* Apply pitch shifting (in semitones) if needed.
* Define the output filename.

Click the execution button to run the morphing process. The synthesized audio will be rendered and available for direct playback or download within the notebook.

---

## Acknowledgements
This project is built upon the DDSP-SVC architecture and expands on the foundational Differentiable Digital Signal Processing concepts introduced by Google.
