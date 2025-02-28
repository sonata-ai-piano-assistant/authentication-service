const helloYou = (name) => {
  name = "you" || name
  console.log("hello" + name + "!")
}

helloYou("world") // hello world!
