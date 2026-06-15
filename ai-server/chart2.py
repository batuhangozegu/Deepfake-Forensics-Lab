import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots(figsize=(6, 4))

kategoriler = ['Train', 'Validation']
fake_counts = [173012, 43877]
real_counts = [27005, 6746]

x = np.arange(len(kategoriler))
width = 0.35

bars1 = ax.bar(x - width/2, fake_counts, width, label='Fake', color='#E74C3C')
bars2 = ax.bar(x + width/2, real_counts, width, label='Real', color='#2ECC71')

ax.set_ylabel('Yüz Görüntüsü Sayısı')
ax.set_title('MTCNN Sonrası Yüz Görüntüsü Dağılımı')
ax.set_xticks(x)
ax.set_xticklabels(kategoriler)
ax.legend()

for bar in bars1 + bars2:
    ax.text(bar.get_x() + bar.get_width()/2., bar.get_height() + 500,
            f'{int(bar.get_height()):,}', ha='center', va='bottom', fontsize=9)

plt.tight_layout()
plt.savefig('/home/bgozegu/Masaüstü/yuz_dagilimi.png', dpi=150, bbox_inches='tight')
print("Kaydedildi: yuz_dagilimi.png")