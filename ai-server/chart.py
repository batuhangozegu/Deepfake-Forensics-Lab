import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parent

datasets = ['Celeb-DF v2', 'DFD', 'FaceForensics++\nC23']
fake_counts = [5639, 3068, 6000]
real_counts = [590, 364, 1000]

x = np.arange(len(datasets))
width = 0.35

fig, ax = plt.subplots(figsize=(8, 5))
bars1 = ax.bar(x - width/2, fake_counts, width, label='Fake', color='#E74C3C')
bars2 = ax.bar(x + width/2, real_counts, width, label='Real', color='#2ECC71')

ax.set_xlabel('Veri Seti')
ax.set_ylabel('Video Sayısı (Ham)')
ax.set_title('Eğitim Veri Setleri — Ham Video Dağılımı')
ax.set_xticks(x)
ax.set_xticklabels(datasets)
ax.legend()

for bar in bars1:
    ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 50,
            f'{int(bar.get_height())}', ha='center', va='bottom', fontsize=9)
for bar in bars2:
    ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 50,
            f'{int(bar.get_height())}', ha='center', va='bottom', fontsize=9)

plt.tight_layout()
plt.savefig(OUTPUT_DIR / 'veri_dagilimi.png', dpi=150, bbox_inches='tight')
print("Kaydedildi: veri_dagilimi.png")