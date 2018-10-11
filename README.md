# redux-quiz

## Dependencies

- Jquery
- Redux
- Handlebars

## How to use

Just clone or download and open the `index.html`.

## About Quiz Data

```json
{
  "questions": [
    {
      "title":
        "Hi there, if you answer two questions, I'll recomment a Chinese dish to you!",
      "options": ["Let's get it!", "Sorry, I'm not interested!"],
      "hides_on": []
    },
    {
      "title": "What flavor do you like?",
      "options": ["Sweet", "Spicy"],
      "hides_on": ["0:1"]
    },
    {
      "title": "Are you vegetarian?",
      "options": ["Yes", "No"],
      "hides_on": ["0:1"]
    }
  ],
  "results": [
    {
      "title": "Thank you!",
      "combo": [["0:1"]],
      "blocks": [
        {
          "title": "No problem! Come back next time",
          "content": "",
          "links": []
        }
      ]
    },
    {
      "title": "Sweet - Vegetarian",
      "combo": [["0:0", "1:0", "2:0"]],
      "blocks": [
        {
          "title": "Caramelized Apple",
          "content": "I found a video of how to cook it",
          "links": [
            {
              "text": "How to cook Caramelized Apple",
              "url": "https://youtu.be/UVFAdlay27o"
            }
          ]
        }
      ]
    },
    {
      "title": "Sweet - Non-vegetarian",
      "combo": [["0:0", "1:0", "2:1"]],
      "blocks": [
        {
          "title": "Sweet and sour pork rib",
          "content": "I found a video of how to cook it",
          "links": [
            {
              "text": "How to cook Sweet and sour pork rib",
              "url": "https://youtu.be/cgSM91WjyuY"
            }
          ]
        }
      ]
    },
    {
      "title": "Spicy - Vegetarian",
      "combo": [["0:0", "1:1", "2:0"]],
      "blocks": [
        {
          "title": "Spicy green pepper",
          "content": "I found a video of how to cook it",
          "links": [
            {
              "text": "How to cook spicy green pepper",
              "url": "https://youtu.be/WnQrCshQOsI"
            }
          ]
        }
      ]
    },
    {
      "title": "Spicy - Non-vegetarian",
      "combo": [["0:0", "1:1", "2:1"]],
      "blocks": [
        {
          "title": "Spicy green bean and ground pork",
          "content": "I found a video of how to cook it",
          "links": [
            {
              "text": "How to cook spicy green bean and ground pork",
              "url": "https://youtu.be/jqwtTBeIxEk"
            }
          ]
        }
      ]
    }
  ],
  "default_result": {
    "title": "Wow",
    "blocks": [
      {
        "title": "Your selection didn't match any answers",
        "content": "Please redo the quiz",
        "links": []
      }
    ]
  }
}
```

### `questions`

Each item of `questions` has:

- `title` - The text content of the question.
- `options` - Options of the question.
- `hides_on` - Hide this question based on current selected options. The item of `hides_on` shouldfollow pattern: `"<questionZeroBasedIndex>:<optionZeroBasedIndex>"`. e.g. `"0:0"`.

### `results`

Each item of `results` has:

- `title` - The title of the result.
- `blocks` - Content blocks of the result.

Each item of `blocks` has:

- `title` - The title of the content block.
- `combo` - Selected options combination. If your selected options match any of `combo`, show this result. The item of `combo` is an array of `"<questionZeroBasedIndex>:<optionZeroBasedIndex>"`. e.g. `["0:0", "1:1", "2:1"]`.
- `content` - The text content of the content block.
- `links` - Some links.

Each item of `links` has:

- `text` - The text content of the link.
- `url` - The url of the link.

### default_result

If the selected options doesn't match any result combo, show this default result. The item of `default_result` is the same with item of `results`.
