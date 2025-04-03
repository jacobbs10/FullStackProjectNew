import { useState, useEffect, useCallback } from "react";
//import ReactDOM from "react-dom/client";
import styles from '../CSS/myStyles.module.css';
import { useSearchParams } from 'react-router-dom';
import { BackButton } from '../components/BackButton';

const AddProduct = () => {
    const [searchParams] = useSearchParams();
    const [form, setForm] = useState({
        product_id: Number(undefined),
        product_name: "",
        product_description: "",
        product_status: false,
        current_stock_level: Number(undefined)
    });

    //let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2UzZWYyMjYyNDRjN2JlZjU3NWViMWEiLCJpYXQiOjE3NDI5OTE2ODQsImV4cCI6MTc0Mjk5NTI4NH0.ZE9nkA_tblHDcXE8UVRt7Z0QNrwuJCRMDtTscp_AuTk";

    const token = sessionStorage.getItem("token");

    const fetchProductData = useCallback(async (id) => {
        console.log('Fetching user data for ID:', id);
        try {
            const response = await fetch(`http://localhost:8000/api/product/${id}`, {
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('product not found');
            }
            const productData = await response.json();
            console.log('Received product data:', productData);

            const inputs = document.getElementsByTagName("input");
            for (let i = 0; i < inputs.length; i++) 
            {
                switch(inputs[i].name)
                {               
                case "product_id":
                {
                    inputs[i].value = productData.product_id || Number(undefined);
                    break;
                }
                case "product_name":
                {
                    inputs[i].value = productData.product_name || "";
                    break;
                }
                case "product_description":
                {
                    inputs[i].value = productData.product_description || "";
                    break;
                }
                case "product_status":
                {
                    inputs[i].value = productData.product_status || false;
                    break;
                }
                case "current_stock_level":
                {
                    inputs[i].value = productData.current_stock_level || Number(undefined) ;
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
                product_id: productData.product_id || Number(undefined),
                product_name: productData.product_name || "",
                product_description: productData.product_description || "",
                product_status: productData.product_status || false,
                current_stock_level: productData.current_stock_level || Number(undefined) 
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            alert('Error fetching product data');
        }
    }, []); // Empty dependency array since it only uses setForm which is stable

    useEffect(() => {
        const id = searchParams.get('id');
        console.log('Current ID from URL:', id);
        if (id) {
            fetchProductData(id);
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
        setForm(prevFormData => ({ product_id: Number(undefined),
            product_name: "",
            product_description: "",
            product_status: false,
            current_stock_level: Number(undefined), }) );

        console.log("after clear form" , form);
        
    }
 

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("in Submit");
        let dummy=true;
        Object.keys(form).forEach(key => {    
            let value = form[key];
            console.log(`${key} ${value}`)
            switch(key){
                case 'product_id':
                    !(isNumber(key, value)) ? dummy=false: dummy=dummy;
                    break;
                case 'product_name':
                    !(chkSize(key, value, 5)) ? dummy=false: dummy=dummy;
                    break;
                case 'product_description': 
                    !(chkSize(key, value, 10)) ? dummy=false: dummy=dummy;
                    break;
                case 'product_status':
                    !(Boolean) ? dummy=false: dummy=dummy;
                    break;
                case 'current_stock_level':
                    !(isNumber(key, value)) ? dummy=false: dummy=dummy;
                    break;
                default:
                    break;
            }
            clearAll();
            window.location.href = "/products";

        })
        console.log("Dum",dummy);
            console.log(`the json: ${JSON.stringify(form)}`);
            if(!dummy)
            {
                clearAll();
               
            }
            else
            {
                
                const id = searchParams.get('id');
                //console.log("id",id);
                const method = id ? 'PUT' : 'POST';
                //console.log("method",method);
                fetch(`http://localhost:8000/api/product`, { method: method,
                    headers: {
                        'Authorization': `${token}`,
                        'Content-Type': 'application/json' // Set the content type to JSON
                    },
                    body: JSON.stringify(form) })
                .then((res) => {
                    console.log(res.status);
                    if (!res.ok) throw new Error("Failed to add product");
                    return res.json();
                })
                .then(data => {
                    console.log("Success:", data); // Handle successful response
                })
                .catch(error => {
                    console.error("Error:", error); // Catch and log any errors
                });
            }
       
        console.log('Show form', form)
    }
    
    const onChangeInput = (event) => {
        const { name, value } = event.target;
        //console.log('name', name)
        //console.log('value', value)
        //console.log('before', form)

        if(name === "product_id" || name === "current_stock_level")
        {
            const idValue = Number(value);
            setForm(prevFormData => ({ ...prevFormData , [name]: idValue, }) )
        }
        else
        {
            setForm(prevFormData => ({ ...prevFormData , [name]: value, }) );            
        }
 

      //console.log('after', form)
      
    }
       

    return (
    <>
    <div className={styles.item1}>
    <h1 className={styles.header}>Product Add or Update</h1>
    </div>
    <div className={styles.container}>
    <form onSubmit={handleSubmit}>
        <input type="text" name="product_id" placeholder="Product ID" onChange={(e) => onChangeInput(e)} />
        <input type="text" name="product_name" placeholder="Product Name" onChange={(e) => onChangeInput(e)} />  
        <input type="text" name="product_description" placeholder="Product Description" onChange={(e) => onChangeInput(e)} />
        <input type="text" name="product_status" placeholder="Product Status" onChange={(e) => onChangeInput(e)} />
        <input type="text" name="current_stock_level" placeholder="Current Stock Level" onChange={(e) => onChangeInput(e)} />            
    <div className={styles.buttonContainer}>
        <button type="submit">Submit</button>
        <button type="reset" onClick={clearAll}>Cancel</button>
    </div>
    </form>

    </div>
    <BackButton showConfirmation={true} />
    </>
    )
  };
  
  export default AddProduct;