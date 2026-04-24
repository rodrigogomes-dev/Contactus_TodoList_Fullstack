#!/bin/bash

# Script para fazer download de 10 avatares do DiceBear (avataaars style)
# Coloca-os em public/avatars/

AVATARS_DIR="public/avatars"

# Criar pasta se não existir
mkdir -p "$AVATARS_DIR"

echo "📥 Fazendo download de 10 avatares DiceBear (avataaars style)..."
echo ""

# Download dos 10 avatares
for i in {1..10}; do
    AVATAR_NAME="avatar-$i"
    URL="https://api.dicebear.com/7.x/avataaars/png?seed=$AVATAR_NAME"
    FILE="$AVATARS_DIR/$AVATAR_NAME.png"
    
    echo "⬇️  Baixando $AVATAR_NAME.png..."
    curl -s "$URL" -o "$FILE"
    
    if [ -f "$FILE" ]; then
        SIZE=$(du -h "$FILE" | cut -f1)
        echo "✅ $AVATAR_NAME.png salvo ($SIZE)"
    else
        echo "❌ Erro ao baixar $AVATAR_NAME.png"
    fi
done

echo ""
echo "🎉 Download completo! Avatares guardados em: $AVATARS_DIR/"
ls -lh "$AVATARS_DIR"
