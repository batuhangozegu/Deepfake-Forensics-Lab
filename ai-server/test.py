import torch
import torchvision.models as models

model = models.efficientnet_b0(weights=None)
model.classifier[1] = torch.nn.Sequential(
    torch.nn.Dropout(p=0.2),
    torch.nn.Linear(1280, 2)
)
model.load_state_dict(torch.load(
    "/home/bgozegu/Masaüstü/BitirmeProjesi/models/best_efficientnet.pth",
    map_location='cpu'
))
print("Yüklendi!")