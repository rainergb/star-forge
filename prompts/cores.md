# Relatório de Paleta de Cores -- Tema Aurelion Sol (Dark Cosmic Theme)

Este documento descreve a paleta oficial utilizada no projeto, inspirada
nas cores do campeão **Aurelion Sol -- The Star Forger**, de *League of
Legends*.\
A proposta do tema é misturar tons **escuros, cósmicos e luminosos**,
com destaques em roxo energético e azul estelar.

------------------------------------------------------------------------

## 🌑 Paleta Principal (Background / Base)

  Uso                         Hex         Descrição
  --------------------------- ----------- --------------------------------
  **Background primário**     `#0A0F26`   Azul-preto cósmico.
  **Background secundário**   `#111832`   Azul escuro suave.
  **Superfícies / Cards**     `#1A2447`   Azul profundo com brilho leve.

------------------------------------------------------------------------

## 💜 Cores de Destaque (Roxo Estelar)

  Uso                  Hex         Descrição
  -------------------- ----------- ----------------------------
  **Primário**         `#6A30FF`   Roxo vivo e energético.
  **Primário Hover**   `#8A52FF`   Roxo mais claro brilhante.
  **Secundário**       `#B57CFF`   Lavanda luminosa.
  **Glow / efeitos**   `#D6B8FF`   Roxo claro quase branco.


------------------------------------------------------------------------

## 🧩 Estrutura de Tema Sugestiva (JavaScript)

``` js
export const theme = {
  colors: {
    background: "#0A0F26",
    backgroundSecondary: "#111832",
    surface: "#1A2447",
    primary: "#6A30FF",
    primaryHover: "#8A52FF",
    highlight: "#B57CFF",
    glow: "#D6B8FF",
    blueAccent: "#1A7FFF",
    text: "#E8E8FF"
  }
}