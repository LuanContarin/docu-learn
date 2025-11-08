import torch

if torch.cuda.is_available():
    print("CUDA is available! Using GPU for computations.")
    device = torch.device("cuda")
else:
    print("CUDA is not available. Using CPU for computations.")
    device = torch.device("cpu")
