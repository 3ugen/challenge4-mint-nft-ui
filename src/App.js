import 'regenerator-runtime/runtime'
import React, {useState} from 'react'
import {Stack} from '@fluentui/react/lib/Stack';
import {login, logout} from './utils'
import Big from 'big.js'
import Text, {
  ActionButton,
  DocumentCard,
  DocumentCardActions,
  DocumentCardDetails,
  DocumentCardImage,
  DocumentCardTitle,
  getTheme, Link,
  PrimaryButton,
  Spinner,
  TextField,
} from '@fluentui/react';


import getConfig from './config'
import {ImageFit} from '@fluentui/react/lib/Image';
import {TestImages} from '@fluentui/example-data';
import {DefaultPalette} from '@fluentui/react/lib/Styling'
import {initializeIcons} from '@fluentui/font-icons-mdl2';
import axios from 'axios';

initializeIcons();

const endpoint = 'https://api.nft.storage' // the default
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGQzZGFiNTg4NEFEYWRjZTFDQTJiRDAxNDQ3RGU5OUQzNmUzOTU1NjgiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYzNzU4ODM3MTUwNSwibmFtZSI6Im5lYXItY2hhbGxlbmdlIn0.2hg_8mofZa-8GFq0A2TRo7FVTwy-vtVXnte8XWun4gI' // your API key from https://nft.storage/manage

const {networkId} = getConfig(process.env.NODE_ENV || 'development')

const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();
const theme = getTheme();
// Styles definition
const stackStyles = {
  root: {
    background: DefaultPalette.neutralLighter,
  },
};
const stackItemStyles = {
  root: {
    background: DefaultPalette.themePrimary,
    color: DefaultPalette.white,
    padding: 5,
  },
};

// Tokens definition
const containerStackTokens = {childrenGap: 5};
const verticalGapStackTokens = {
  childrenGap: 10,
  padding: 10,
};
const itemAlignmentsStackTokens = {
  childrenGap: 5,
  padding: 10,
};
const clickableStackTokens = {
  padding: 10,
};

const testText = 'Welcome to Near NFT Mint!'

export default function App() {
  const [selectedImage, setSelectedImage] = useState()
  const [title, setTitle] = useState("")
  const [nftId, setNftId] = useState(0)
  const [description, setDescription] = useState("")
  const [mintingState, setMintingState] = useState(0)
  const addFriendIcon = {iconName: 'SignOut'}
  const uploadIcon = {iconName: 'Upload'}
  const deleteIcon = {iconName: 'Delete'}
  const cardStyles = {
    root: {display: 'inline-block', marginRight: 20, marginBottom: 20, width: 320},
  };


  // if not signed in, return early with sign-in prompt

  if (!window.walletConnection.isSignedIn()) {
    console.log('sign in pls')
    return (
      <Stack styles={stackStyles} tokens={itemAlignmentsStackTokens}>
        <Stack.Item align={"center"}>
          Welcome to Near NFT Mint!
        </Stack.Item>
        <Stack.Item align={"center"}>
          Go ahead and click the button below to try it out:
        </Stack.Item>
        <Stack.Item align="center" styles={stackItemStyles}>
          <PrimaryButton text="Sign in" onClick={login} allowDisabledFocus/>
        </Stack.Item>
      </Stack>
    )
  }

  // This function will be triggered when the file field change
  const imageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      console.log(`set image ${e.target.files[0].name}`)
      setSelectedImage(e.target.files[0]);
    }
  };

  // This function will be triggered when the "Remove This Image" button is clicked
  const removeSelectedImage = () => {
    setSelectedImage();
  };

  const previewProps = {
    previewImages: [
      {
        name: 'Revenue stream proposal fiscal year 2016 version02.pptx',
        linkProps: {
          href: 'http://bing.com',
          target: '_blank',
        },
        previewImageSrc: TestImages.documentPreview,
        iconSrc: TestImages.iconPpt,
        imageFit: ImageFit.cover,
        width: 318,
        height: 196,
      },
    ],
  };
  const DocumentCardActivityPeople = [{name: 'Annie Lindqvist', profileImageSrc: TestImages.personaFemale}];

  // use React Hooks to store greeting in component state
  // const [greeting, set_greeting] = React.useState()

  // when the user has not yet interacted with the form, disable the button
  // const [buttonDisabled, setButtonDisabled] = React.useState(true)

  // after submitting the form, we want to show Notification
  // const [showNotification, setShowNotification] = React.useState(false)

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      /*if (window.walletConnection.isSignedIn()) {

        // window.contract is set by initContract in index.js
        window.contract.get_greeting({account_id: window.accountId})
          .then(greetingFromContract => {
            // set_greeting(greetingFromContract)
          })
      }*/
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  )


  function _alertClicked() {
    alert('Clicked');
  }

  const onResetState = () => {
    setTitle("")
    setDescription("")
    selectedImage()
    setMintingState(0)
  }

  // On file upload (click the upload button)
  const onFileUpload = () => {

    setMintingState(1)
    // Create an object of formData
    let blobImg = new Blob([selectedImage], {type: "image/jpg"});
    const formData = new FormData();
    formData.append('file', blobImg, selectedImage.name)
    axios.post(
      "https://api.nft.storage/upload",
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    ).then(
      resp => {
        if (resp.status === 200) {
          let data = resp.data
          console.log(`storage status: ${data.ok}`)
          console.log(`storage value: ${JSON.stringify(data.value)}`)
          console.log(`cid: ${data.value.cid} name: ${data.value.files[0].name}`)
          let media_url = `https://${data.value.cid}.ipfs.dweb.link/${data.value.files[0].name}`
          console.log(`media_url: ${media_url}`)
          window.contract.nft_mint({
              token_id: nftId.toString(),
              receiver_id: "3ugen.testnet",
              token_metadata: {
                title: title,
                description: description,
                media: media_url,
                copies: 1
              },
            },
            BOATLOAD_OF_GAS,
            Big(0.1).times(10 ** 24).toFixed()
          )
            .then((res) => {
              console.log(`result: ${res}`)
              setMintingState(2)
            })
        } else {
          console.log(`upload error, server status: ${resp.status}`)
          setMintingState(0)
        }
      }
    ).catch((err) => {
      console.log(`transaction error: ${err}`)
      setMintingState(0)
    })
    ;
  };

  const handleTitleChange = (msg) => {
    console.log(`new title: ${msg.target.value}`)
    let newMsg = msg.target.value;
    setTitle(newMsg)
  }
  const handleDescriptionChange = (msg) => {
    console.log(`new description: ${msg.target.value}`)
    let newMsg = msg.target.value;
    setDescription(newMsg)
  }
  const handleIdChange = (msg) => {
    console.log(`new ID: ${msg.target.value}`)
    let newMsg = msg.target.value;
    if (newMsg.length > 0) {
      if (!isNaN(newMsg)) {
        setNftId(parseInt(msg.target.value, 10));
      } else {
        setNftId(0)
      }
    } else {
      setNftId(0)
    }

  }


  return (
    // use React Fragment, <>, to avoid wrapping elements in unnecessary divs
    <Stack styles={stackStyles} tokens={itemAlignmentsStackTokens}>
      <Stack.Item align="end">
        <ActionButton iconProps={addFriendIcon} onClick={logout} allowDisabledFocus disabled={false} checked={false}>
          Log out
        </ActionButton>
      </Stack.Item>
      <Stack.Item align="center">
        <form>
          <input type="file" accept="image/*" name="picture" onChange={imageChange}/>
        </form>
      </Stack.Item>
      <Stack.Item align={"center"}>
        {selectedImage && mintingState !==2 && <DocumentCard
          aria-label={
            'Document Card with image. How to make a good design. '
          }
          styles={cardStyles}
        >
          <DocumentCardImage height={300} imageFit={ImageFit.cover} imageSrc={URL.createObjectURL(selectedImage)}/>
          <DocumentCardDetails>
            <DocumentCardTitle title="NFT Picture" shouldTruncate/>
            <DocumentCardActions actions={[{
              iconProps: {iconName: 'Delete'},
              onClick: () => removeSelectedImage(),
              ariaLabel: 'notifications action',
            }]}/>
          </DocumentCardDetails>
          {/*<DocumentCardActivity activity="Modified March 13, 2018" people={people.slice(0, 3)} />*/}
        </DocumentCard>}
      </Stack.Item>
      {selectedImage && mintingState !==2 && <Stack.Item align="center">
        <TextField // prettier-ignore
          label="Set NFT ID"
          prefix="ID"
          placeholder="NFT ID number"
          ariaLabel="set nft title"
          value={nftId}
          onChange={(msg) => handleIdChange(msg)}
        />
      </Stack.Item>}
      {selectedImage && mintingState !==2 && <Stack.Item align="center">
        <TextField // prettier-ignore
          label="Set NFT Title"
          prefix="Title"
          placeholder="Awesome art"
          ariaLabel="set nft title"
          value={title}
          onChange={(msg) => handleTitleChange(msg)}
        />
      </Stack.Item>}
      {selectedImage && mintingState !==2 && <Stack.Item align="center">
        <TextField // prettier-ignore
          label="Set NFT Description"
          prefix="Description"
          placeholder="My NFT media"
          ariaLabel="set nft description"
          value={description}
          onChange={(msg) => handleDescriptionChange(msg)}
        />
      </Stack.Item>}
      {selectedImage && mintingState === 0 && <Stack.Item align="center">
        <PrimaryButton onClick={onFileUpload}
                       allowDisabledFocus disabled={!(title.length > 0 && description.length > 0)}
                       checked={false}>
          Mint NFT
        </PrimaryButton>
      </Stack.Item>}
      {mintingState === 1 && <Stack.Item align="center">
        <Spinner label="Transaction sending ..." ariaLive="assertive" labelPosition="right"/>
      </Stack.Item>}
      {mintingState === 2 && <Stack.Item align="center">
        Check new NFT in your <Link href="https://wallet.near.org/?tab=collectibles">Near Wallet Collectibles</Link>
      </Stack.Item>}
      {mintingState === 2 && <Stack.Item align="center">
        <PrimaryButton onClick={onResetState}
                       allowDisabledFocus disabled={false}
                       checked={false}>
          Mint another NFT
        </PrimaryButton>
      </Stack.Item>}
      {/*{showNotification && <Notification />}*/}
    </Stack>
  )
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <aside>
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
        {window.accountId}
      </a>
      {' '/* React trims whitespace around tags; insert literal space character when needed */}
      called method: 'set_greeting' in contract:
      {' '}
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  )
}
