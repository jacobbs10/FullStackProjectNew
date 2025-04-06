import { useState, useEffect, useCallback } from "react";
//import ReactDOM from "react-dom/client";
import styles from '../CSS/myStyles.module.css';
import { useSearchParams } from 'react-router-dom';
import { BackButton } from '../components/BackButton';

const AddUser = () => {
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({
        username: "",
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        usertype: "",
        birthdate: "",
        preferences: {
            pagesize:Number(undefined)
        }
    });

    const [isUpdate, setIsUpdate] = useState();
    //let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2UzZWYyMjYyNDRjN2JlZjU3NWViMWEiLCJpYXQiOjE3NDI5OTE2ODQsImV4cCI6MTc0Mjk5NTI4NH0.ZE9nkA_tblHDcXE8UVRt7Z0QNrwuJCRMDtTscp_AuTk";

    const token = sessionStorage.getItem("token");

    // Add this state to track the logged-in username
    const [loggedInUsername, setLoggedInUsername] = useState(sessionStorage.getItem("userName"));

    const [usernameForUpdate, setUsernameForUpdate] = useState("");

    const getMenuType = () => {
        const menuType = sessionStorage.getItem("menuType") || "";

        console.log(`menuType: ${menuType}`);

        return menuType;
    }

    const fetchUserData = useCallback(async (id) => {
        console.log('Fetching user data for ID:', id);
        try {
            const response = await fetch(`http://localhost:8000/userAct/user/${id}`, {
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('user not found');
            }
            const userData = await response.json();
            console.log('Received user data:', userData);

            const inputs = document.getElementsByTagName("input");
            for (let i = 0; i < inputs.length; i++) 
            {
                switch(inputs[i].name)
                {               
                case "username":
                {
                    inputs[i].value = userData.username || "";
                    setUsernameForUpdate(userData.username);
                    break;
                }
                case "firstname":
                {
                    inputs[i].value = userData.firstname || "";
                    break;
                }
                case "lastname":
                {
                    inputs[i].value = userData.lastname || "";
                    break;
                }
                case "email":
                {
                    inputs[i].value = userData.email || "";
                    break;
                }
                case "password":
                {
                    inputs[i].value = userData.password || "";
                    break;
                }
                case "usertype":
                {
                    inputs[i].value = userData.usertype || "";
                    break;
                }
                case "birthdate":
                {
                    const date = userData.birthdate ? new Date(userData.birthdate).toISOString().split('T')[0] : "";
                    inputs[i].value = date;
                    break;
                }
                case "pagesize":
                {
                    inputs[i].value = userData.preferences?.pagesize || 12;
                    break;
                }
                default:
                {
                    break;
                }
            }
        }
            
            // Map the API data to our form structure
            setForm({
                username: userData.username || "",
                firstname: userData.firstname || "",
                lastname: userData.lastname || "",
                email: userData.email || "",
                password: userData.password || "",
                usertype: userData.usertype || "",
                birthdate: userData.birthdate ? new Date(userData.birthdate).toISOString().split('T')[0] : "",
                preferences: {
                    pagesize: userData.preferences?.pagesize || 12
                }
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            alert('Error fetching user data');
        }
    }, []); // Empty dependency array since it only uses setForm which is stable

    useEffect(() => {
        const username = searchParams.get('username');
        console.log('Current Username from URL:', username);
        if (username !== null && username !== "" && username !== "null") {
            fetchUserData(username);
            setIsUpdate(true);
        }
        else
        {
            setIsUpdate(false);
        }
    }, [searchParams]);

    const isNumber = (name, value) => {
        console.log("in");
        let inputNum=Number(value);
        if (!Number.isFinite(inputNum))
        {
            setForm(prevFormData => ({ [name]: "", }) )
            alert(`${name}: ${inputNum} is not a valid number`)
            return false;
        }
        return true;
    }
    
    const chkSize = (name, value , size) => {
        let inputstr=value;
        console.log(`${name} ${value} ${size}`)
        if (inputstr.length<Number(size))
        {
            //document.getElementById(id).value="";
            //setForm(prevFormData => ({ [name]: "", }) )
            alert(`${name}: ${inputstr} is too short`)
            return false;
        }
        return true;
    }

    const chkType = (name, value) => {
        switch (    value)
        {
            case "admin":
            case "implementer":
            case "user":
            {
                return true;
            }
            default:
            {
                //document.getElementById(id).value="";
                //setForm(prevFormData => ({ [name]: "", }) )
                alert(`${name}: ${value} can only be admin, implementer or viewer`)
                return false;
            }
        }
    }

    const isCorrectEmail = (name, value) => {
        let inputEmails=value;
        if (inputEmails.search("@")<0 )
        {
            //document.getElementById(id).value="";
            setForm(prevFormData => ({ [name]: "", }) )
            alert(`${name}: ${inputEmails} is not a valid email missing @`)
            return false;
        }
        else{
            let pos=inputEmails.search("@");
            let afterPos=inputEmails.slice(pos);
            
            if(afterPos.search(/\./)<0)
            {
                //ocument.getElementById(id).value="";
                setForm(prevFormData => ({ [name]: "", }) )
                alert(`${name}: ${inputEmails} is not a valid email missing .`)
                return false;
            }
            return true;
        }
    }
    
    const clearAll = () => {
        console.log("clearing");
        const inputs = document.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) 
        {
            switch(inputs[i].type)
            {
                case "text":
                {
                    inputs[i].value = "";
                    break;
                }
                case "email":
                {
                    inputs[i].value = "";
                    break;
                }
                case "password":
                {
                    inputs[i].value = "";
                    break;
                }
                case "radio":
                {
                    inputs[i].checked = false;
                    break;
                }
                case "checkbox":
                {
                    inputs[i].checked = false;
                    break;
                }
                default:
                {
                    break;
                }
            }
        }
        //document.getElementById("phonePrefix").value="";
        
        console.log("In handleCancel")
        setForm(prevFormData => ({ username: "",
            firstname: "",
            lastname: "",
            email: "",
            password: "",
            usertype: "",
            birthdate: "",
            preferences: {
                pagesize:Number(undefined)
            }
        }) );

        console.log("after clear form" , form);
        
    }
 

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("in Submit");
        let dummy = true;
        
        Object.keys(form).forEach(key => {    
            let value = form[key];
            console.log(`${key} ${value}`)
            switch(key){
                case 'username':
                    !(chkSize(key, value, 3)) ? dummy=false: dummy=dummy;
                    break;                    
                case 'firstname':
                    !(chkSize(key, value, 2)) ? dummy=false: dummy=dummy;
                    break;
                case 'lastname': 
                    !(chkSize(key, value, 2)) ? dummy=false: dummy=dummy;
                    break;
                case 'email':
                    !(isCorrectEmail(key, value)) ? dummy=false: dummy=dummy;
                    break;
                case 'password':
                    !(chkSize(key, value,8)) ? dummy=false: dummy=dummy;
                    break;
                case 'usertype':
                    !(chkType(key, value)) ? dummy=false: dummy=dummy;
                    break;
                case 'birthdate':
                    !(isValidDate(key, value)) ? dummy=false : dummy=dummy;
                    break;
                case 'preferences':
                    !(isNumber(key, value.pagesize)) ? dummy=false : dummy=dummy;
                    break;
                default:
                    break;
            }
            //clearAll();
            

        })
        console.log("Dum",dummy);
        console.log(`the json: ${JSON.stringify(form)}`);
        if(!dummy)
        {
            clearAll();
            //window.location.href = "/users";
            window.parent.history.back();
            
        }
        else
        {
            try {
                const postPath = isUpdate ? 'userAct/user' : 'auth/register';
                console.log(`postPath: ${postPath}`);
                
                const response = await fetch(`http://localhost:8000/${postPath}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(form)
                });

                if (!response.ok) {
                    throw new Error(`Failed to ${isUpdate ? 'Update' : 'Add'} User`);
                }

                const data = await response.json();
                console.log("Success:", data);

                // Check if user is updating their own profile
                if (form.username === sessionStorage.getItem("userName")) {
                    // Update session pagesize
                    sessionStorage.setItem("pagesize", form.preferences.pagesize);
                    console.log("Updated session pagesize to:", form.preferences.pagesize);
                }

                if (isUpdate) {
                    // Refresh the user data after successful update
                    await fetchUserData(form.username);
                    alert('User updated successfully!');
                } else {
                    clearAll();
                    window.parent.history.back();
                }
                window.parent.history.back();
            } catch (error) {
                console.error("Error:", error);
                alert(`Error: ${error.message}`);
            }
        }
    }
    
    const onChangeInput = (event) => {
        const { name, value } = event.target;

         //console.log('name', name)
        //console.log('value', value)
        //console.log('before', form)

        if (name === 'pagesize') {
            setForm(prevFormData => ({
                ...prevFormData,
                preferences: {
                    ...prevFormData.preferences,
                    pagesize: Number(value)
                }
            }));
        } else {
            setForm(prevFormData => ({ ...prevFormData, [name]: value }));
        }
    }

    const onReset = () => {
        clearAll();
        //window.location.href = "/users";
        window.parent.history.back();
    }
       

    // Add birthdate validation
    const isValidDate = (name, value) => {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            alert(`${name}: Invalid date format. Use YYYY-MM-DD`);
            return false;
        }
        return true;
    };



    return (
    <>
    <div className={styles.item1}>
        <h1 className={styles.header}>
            {isUpdate ? 'Update User' : 'Add User'}
        </h1>
    </div>
    <div className={styles.container}>
    <form onSubmit={handleSubmit}>
        <input type="text" name="firstname" placeholder="First Name" onChange={(e) => onChangeInput(e)} />
        <input type="text" name="lastname" placeholder="Last Name" onChange={(e) => onChangeInput(e)} />  
        <input type="text" name="email" placeholder="Email" onChange={(e) => onChangeInput(e)} />
        <select 
            name="usertype" 
            onChange={(e) => onChangeInput(e)}
            value={form.usertype}
            className={styles.inputBox}
            required
            disabled={
                // Non-admin can't change usertype during update
                (getMenuType() !== "admin" && isUpdate) ||
                // Admin can't change their own usertype
                (getMenuType() === "admin" && isUpdate && usernameForUpdate === loggedInUsername)
            }
        >
            <option value="">Select User Type</option>
            <option value="admin">Admin</option>
            <option value="implementer">Implementer</option>
            <option value="user">User</option>
        </select>
        <input type="text" name="username" placeholder="Username" onChange={(e) => onChangeInput(e)} />
        {(getMenuType() === "admin" && !isUpdate) && (
            <input type="text" name="password" placeholder="Password" onChange={(e) => onChangeInput(e)} />            
        )}
        <input 
            type="date" 
            name="birthdate" 
            placeholder="Birth Date" 
            onChange={(e) => onChangeInput(e)}
            required 
        />
        <input 
            type="number" 
            name="pagesize" 
            placeholder="Page Size" 
            min="1"
            onChange={(e) => onChangeInput(e)}
            defaultValue={10}
        />
        <div className={styles.buttonContainer}>
            <button type="submit">Submit</button>
            <button type="reset" onClick={onReset}>Cancel</button>
        </div>
    </form>
    </div>
    <BackButton showConfirmation={false} />
    </>
    )
  };
  
  export default AddUser;