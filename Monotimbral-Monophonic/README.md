# Morphoné: Monotimbral-Monophonic Timbre Transfer

## Overview
This repository focuses on Monotimbral-Monophonic timbre transfers utilizing variations of the DDSP (Differentiable Digital Signal Processing) Timbre Transfer algorithm originally introduced by Google Magenta. 

It should be noted that, for many applications, the tools offered by Google Magenta are still to be taken into account as an immediate way to create a first, rough transfer that will generate partially satisfactory results. They can, then, be perfected with what follows here. Starting reference would be https://github.com/magenta/ddsp.

Within this directory, we provide two separate Google Colab notebooks. These notebooks are structured to handle the entire pipeline (setup, preprocessing, training, and inference) for two distinct models based on the DDSP-SVC architecture. The primary difference between the two implementations lies in the acoustic encoder used for feature extraction:
* **HubertSoft Encoder:** Provided in `Encoder_HubertSoft.ipynb`
* **ContentVec Encoder:** Provided in `Encoder_ContentVec.ipynb`

## Performance Note & Our Experiment
For our specific research goals, we utilized the NSynth dataset for both training and validation, sourced directly from [Google Magenta](https://magenta.withgoogle.com/datasets/nsynth). We focused on training the model to accurately reproduce the sound of a 'brass' instrument. After evaluating multiple training epochs and checkpoints, we successfully converted a monotimbral-monophonic saxophone audio file into a realistic brass sound.

Following these experimental evaluations, we concluded that the **HubertSoft** encoder yielded significantly more satisfying results from a musical and artistic perspective compared to the ContentVec alternative.

## Custom Datasets
While our experiments were conducted using the NSynth dataset, users are completely free to utilize their own preferred custom audio datasets. Ensure that all custom datasets adhere to the following technical requirements:
* Audio files must be in `.wav` format.
* Each audio sample must have a minimum duration of 2 seconds.

---

## Prerequisites and Core Repository Setup
To successfully run the code and train the models, it is mandatory to rely on the core framework from the original DDSP-SVC project. You must clone or download the source repository from `https://github.com/yxlllc/DDSP-SVC`, as it contains all the essential directory structures, scripts, and dependencies required to operate the model. 

## Pre-trained Model Configuration
Before initializing the training or inference procedures, specific pre-trained models must be downloaded and placed into their designated directories within the cloned workspace. 

* **Feature Encoders (Choose the one corresponding to your notebook):**
  * *ContentVec:* Download the pre-trained ContentVec encoder weights and place the file inside the `pretrain/contentvec` directory.
  * *HubertSoft:* Download the pre-trained HubertSoft encoder weights, place the file inside the `pretrain/hubert` directory, and ensure the configuration file `configs/reflow.yaml` is updated accordingly.
* **Vocoder:**
  Download and extract the pre-trained NSF-HiFiGAN vocoder. The model checkpoint should be placed at the path specified by the `vocoder.ckpt` parameter in your configuration file (the default location is `pretrain/nsf_hifigan/model`). Additionally, the associated `config.json` file must reside in the exact same directory (e.g., `pretrain/nsf_hifigan/config.json`).
* **Pitch Extractor:**
  Download the pre-trained RMVPE pitch extractor, extract the contents, and place the resulting file directly into the `pretrain/` folder.

---

## Custom Training and Inference Instructions

The provided Colab notebooks are designed to be executed sequentially. Follow the instructions below to configure the environment, perform custom training, and utilize the model for inference.

### 1. Environment Setup
Open your preferred notebook (`Encoder_HubertSoft.ipynb` or `Encoder_ContentVec.ipynb`) in Google Colab. Run the first cell to clone the official DDSP-SVC repository into the execution environment and install all necessary dependencies. If you are using the ContentVec notebook, a dedicated cell will automatically download the required pre-trained weights from Hugging Face.

### 2. Dataset Preparation
Ensure your `.wav` dataset files are uploaded to the `./data/train/audio` and `./data/val/audio` folders. Run the interactive configuration cell to:
* Select up to 5 target acoustic instruments from the available dataset.
* Define the maximum number of audio samples to utilize for training.

The subsequent cell will scan the repository, match the requested instruments, and copy the subset to the local Colab SSD (`/content/dataset_temp`) to improve I/O speeds during training.

### 3. Preprocessing
Execute the preprocessing cell. The `preprocess.py` script will process the audio files copied to the local SSD to extract the fundamental frequency (F0) and the acoustic features using the selected encoder. This step generates the matrices required by the DDSP and diffusion models.

### 4. Model Training
Run the training cell to start the optimization loop via `train_reflow.py`. The model will train based on the hyperparameters defined in the `configs/reflow.yaml` file. Checkpoints will be saved periodically inside the `./exp` directory.

### 5. Inference and Morphing
Once a checkpoint is generated, you can use the final cell of the notebook to perform inference on new audio files. Through the interactive graphical interface, you must:
* Select the source audio file (`.wav`).
* Select the desired trained checkpoint (`.pt`).
* Apply pitch shifting (in semitones) if needed.
* Define the output filename.

Click the execution button to run the morphing process. The synthesized audio will be rendered and available for direct playback or download within the notebook.

---

## Acknowledgements
This project utilizes the DDSP-SVC architecture created by `yxlllc` and expands upon the foundational Differentiable Digital Signal Processing concepts introduced by Google Magenta, already quoted at the beginning of this document.
